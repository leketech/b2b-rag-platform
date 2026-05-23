# infra/terraform/modules/eks/main.tf
# =============================================================================
# EKS Module: Cluster, Node Group, GitHub Actions OIDC Access, and IRSA
# =============================================================================

terraform {
  required_providers {
    tls = {
      source  = "hashicorp/tls"
      version = "~> 4.0"
    }
  }
}

# =============================================================================
# IAM Role for EKS Cluster
# =============================================================================
resource "aws_iam_role" "eks_cluster" {
  name = "${var.cluster_name}-cluster-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = {
        Service = "eks.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "eks_cluster_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
  role       = aws_iam_role.eks_cluster.name
}

# =============================================================================
# EKS Cluster (CRITICAL: This was missing - restoring it now)
# =============================================================================
resource "aws_eks_cluster" "this" {
  name     = var.cluster_name
  role_arn = aws_iam_role.eks_cluster.arn

  vpc_config {
    subnet_ids             = var.subnet_ids
    endpoint_public_access = true
  }

  # Note: We manage authentication_mode via AWS CLI to avoid cluster recreation
  # access_config {
  #   authentication_mode = "API_AND_CONFIG_MAP"
  # }

  depends_on = [aws_iam_role_policy_attachment.eks_cluster_policy]
}

# =============================================================================
# IAM Role for Worker Nodes
# =============================================================================
resource "aws_iam_role" "eks_nodes" {
  name = "${var.cluster_name}-node-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = {
        Service = "ec2.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "eks_nodes" {
  for_each = toset([
    "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy",
    "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy",
    "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
  ])
  policy_arn = each.value
  role       = aws_iam_role.eks_nodes.name
}

# =============================================================================
# Managed Node Group
# =============================================================================
resource "aws_eks_node_group" "this" {
  cluster_name    = aws_eks_cluster.this.name
  node_group_name = "${var.cluster_name}-nodes"
  node_role_arn   = aws_iam_role.eks_nodes.arn
  subnet_ids      = var.subnet_ids
  instance_types  = var.node_instance_types
  capacity_type   = var.capacity_type

  scaling_config {
    desired_size = var.desired_size
    min_size     = var.min_size
    max_size     = var.max_size
  }

  update_config {
    max_unavailable = 1
  }

  depends_on = [
    aws_iam_role_policy_attachment.eks_nodes,
    aws_eks_cluster.this
  ]

  tags = {
    Environment = var.environment
  }
}

# =============================================================================
# GitHub Actions OIDC RBAC: Modern EKS Access Entry (AWS-native)
# =============================================================================

# 1. Create the Access Entry (NO kubernetes_groups for STANDARD type)
resource "aws_eks_access_entry" "github_actions" {
  for_each = var.github_actions_role_arn != "" ? toset(["github_actions"]) : toset([])

  cluster_name  = aws_eks_cluster.this.name
  principal_arn = var.github_actions_role_arn
  type          = "STANDARD"

  tags = {
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

# 2. Attach Cluster Admin Policy via Policy Association (replaces system:masters)
resource "aws_eks_access_policy_association" "github_actions_admin" {
  for_each = var.github_actions_role_arn != "" ? toset(["github_actions"]) : toset([])

  cluster_name  = aws_eks_cluster.this.name
  principal_arn = var.github_actions_role_arn
  policy_arn    = "arn:aws:eks::aws:cluster-access-policy/AmazonEKSClusterAdminPolicy"

  access_scope {
    type = "cluster"
  }

  depends_on = [aws_eks_access_entry.github_actions]
}

# =============================================================================
# OIDC Provider for IRSA (IAM Roles for Service Accounts)
# =============================================================================
data "tls_certificate" "eks_oidc" {
  url = aws_eks_cluster.this.identity[0].oidc[0].issuer
}

resource "aws_iam_openid_connect_provider" "eks" {
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = [data.tls_certificate.eks_oidc.certificates[0].sha1_fingerprint]
  url             = aws_eks_cluster.this.identity[0].oidc[0].issuer

  tags = {
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}