# infra/terraform/modules/eks/variables.tf

variable "cluster_name" {
  description = "Name of the EKS cluster"
  type        = string
}

variable "subnet_ids" {
  description = "Subnet IDs for the EKS cluster"
  type        = list(string)
}

variable "node_instance_types" {
  description = "EC2 instance types for node group"
  type        = list(string)
  default     = ["t3.medium"]
}

variable "desired_size" {
  description = "Desired number of nodes"
  type        = number
  default     = 2
}

variable "min_size" {
  description = "Minimum number of nodes"
  type        = number
  default     = 1
}

variable "max_size" {
  description = "Maximum number of nodes"
  type        = number
  default     = 4
}

variable "capacity_type" {
  description = "Node capacity type: ON_DEMAND or SPOT"
  type        = string
  default     = "ON_DEMAND"
}

variable "environment" {
  description = "Environment name (staging/prod)"
  type        = string
}

# 👇 GitHub Actions OIDC Role ARN (optional)
variable "github_actions_role_arn" {
  description = "IAM Role ARN for GitHub Actions OIDC access"
  type        = string
  default     = ""
}

variable "authentication_mode" {
  description = "EKS cluster authentication mode: CONFIG_MAP, API, or API_AND_CONFIG_MAP"
  type        = string
  default     = "API_AND_CONFIG_MAP"
}