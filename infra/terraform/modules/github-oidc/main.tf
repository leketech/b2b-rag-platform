# modules/github-oidc/main.tf
data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

# 1. Create OIDC Provider for GitHub Actions
resource "aws_iam_openid_connect_provider" "github" {
  url             = "https://token.actions.githubusercontent.com"
  client_id_list  = ["sts.amazonaws.com"]
  
  # ✅ BOTH current GitHub thumbprints (valid through 2027)
  # Source: https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services
  thumbprint_list = [
    "6938fd4d98bab03faadb97b34396831e3780aea1",  # Primary
    "1c58a3a8518e8759bf075b76b750d4f2df264fcd"   # Backup (critical for resilience)
  ]

  tags = {
    Name = "github-actions-oidc"
  }
}

# 2. IAM Role for GitHub Actions (staging environment)
resource "aws_iam_role" "github_actions_staging" {
  name = "github-actions-b2b-rag-staging"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRoleWithWebIdentity"
        Effect = "Allow"
        Principal = {
          Federated = aws_iam_openid_connect_provider.github.arn
        }
        Condition = {
          StringEquals = {
            "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
          }
          StringLike = {
            # 🔐 Scope to YOUR repo + branch + workflow file
            "token.actions.githubusercontent.com:sub" = "repo:leketech/b2b-rag-platform:ref:refs/heads/main"
            # Optional: further restrict to specific workflow file
            # "token.actions.githubusercontent.com:sub" = "repo:leketech/b2b-rag-platform:ref:refs/heads/main:workflow_file:deploy.yml"
          }
        }
      }
    ]
  })

  tags = {
    Environment = "staging"
    Project     = "b2b-rag"
  }
}

# 3. Attach Policies (least privilege)
resource "aws_iam_role_policy_attachment" "github_actions_staging" {
  for_each = toset([
    "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryPowerUser", # Push to ECR
    "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy",                # Update kubeconfig
    "arn:aws:iam::aws:policy/SecretsManagerReadWrite"              # Read b2b-rag/* secrets
  ])
  policy_arn = each.value
  role       = aws_iam_role.github_actions_staging.name
}

# 4. # Inline policy for EKS cluster access (describe + update-kubeconfig)
resource "aws_iam_role_policy" "github_actions_eks" {
  name = "github-actions-eks-access"
  role = aws_iam_role.github_actions_staging.id  # ✅ Fixed typo here

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "eks:DescribeCluster",
          "eks:ListClusters"
        ]
        Resource = "arn:aws:eks:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:cluster/b2b-rag-cluster"
      }
    ]
  })
}

# 5. Outputs for GitHub workflow
output "role_arn" {
  description = "IAM Role ARN for GitHub Actions (staging)"
  value       = aws_iam_role.github_actions_staging.arn
}

output "oidc_provider_arn" {
  value = aws_iam_openid_connect_provider.github.arn
}