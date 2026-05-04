# RDS
output "rds_endpoint" {
  description = "RDS PostgreSQL endpoint"
  value       = module.rds.db_endpoint
  sensitive   = true
}

output "rds_secret_arn" {
  description = "ARN of RDS password in Secrets Manager"
  value       = module.rds.db_secret_arn
}

# EKS
output "eks_cluster_name" {
  description = "EKS cluster name"
  value       = module.eks.cluster_name
}

output "eks_cluster_endpoint" {
  description = "EKS cluster API endpoint"
  value       = module.eks.cluster_endpoint
  sensitive   = true
}

output "eks_cluster_security_group_id" {
  description = "Security group ID for EKS control plane"
  value       = module.eks.cluster_security_group_id
}

# Networking
output "vpc_id" {
  description = "VPC ID"
  value       = module.networking.vpc_id
}

output "private_subnet_ids" {
  description = "Private subnet IDs for workloads"
  value       = module.networking.private_subnet_ids
}

output "public_subnet_ids" {
  description = "Public subnet IDs (for ALB, bastion)"
  value       = module.networking.public_subnet_ids
}

# S3
output "documents_bucket" {
  description = "S3 bucket for documents"
  value       = module.s3.bucket_name
}

output "documents_bucket_arn" {
  description = "ARN of the documents bucket"
  value       = module.s3.bucket_arn
}

# GitHub OIDC Role ARN
output "github_oidc_role_arn" {
  description = "IAM Role ARN for GitHub Actions (staging)"
  value       = module.github_oidc.role_arn
}