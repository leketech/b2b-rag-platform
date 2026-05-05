# infra/terraform/environments/staging/outputs.tf
output "cluster_name" {
  description = "EKS cluster name"
  value       = module.eks.cluster_name
}

output "cluster_endpoint" {
  description = "EKS cluster API endpoint"
  value       = module.eks.cluster_endpoint
  sensitive   = true
}

output "cluster_certificate_authority_data" {
  description = "EKS cluster CA certificate (base64 encoded)"
  value       = module.eks.cluster_certificate_authority_data
  sensitive   = true
}

output "cluster_security_group_id" {
  description = "Security group ID for EKS control plane"
  value       = module.eks.cluster_security_group_id
}

output "github_oidc_role_arn" {
  description = "IAM Role ARN for GitHub Actions OIDC authentication"
  value       = module.github_oidc.role_arn
}

output "rds_endpoint" {
  description = "RDS PostgreSQL endpoint (host:port)"
  value       = module.rds.db_endpoint
  sensitive   = true
}

output "rds_secret_arn" {
  description = "ARN of RDS password in AWS Secrets Manager"
  value       = module.rds.db_secret_arn
}

output "documents_bucket_name" {
  description = "S3 bucket name for document storage"
  value       = module.s3.bucket_name
}

output "vpc_id" {
  description = "VPC ID"
  value       = module.networking.vpc_id
}

output "private_subnet_ids" {
  description = "Private subnet IDs for workloads (EKS, RDS)"
  value       = module.networking.private_subnet_ids
}