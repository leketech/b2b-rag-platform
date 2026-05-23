# infra/terraform/environments/staging/variables.tf
# =============================================================================
# AWS Free Tier Optimized Variables
# =============================================================================

variable "region" {
  description = "AWS region (us-east-1 has most Free Tier resources)"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "staging"
}

variable "project_name" {
  description = "Project name for tagging"
  type        = string
  default     = "b2b-rag"
}

# Networking (Free Tier safe)
variable "vpc_cidr" {
  default = "10.0.0.0/16"
}

variable "public_subnet_azs" {
  default = ["us-east-1a", "us-east-1b"]  # Two AZs required for private subnet groups and better availability
}

variable "private_subnet_azs" {
  default = ["us-east-1a", "us-east-1b"]  # Two AZs required by RDS subnet groups
}

# EKS Nodes: t3.micro (Free Tier eligible)
variable "node_instance_types" {
  description = "EC2 instance types (t3.micro = Free Tier)"
  type        = list(string)
  default     = ["t3.micro"]  # ✅ 1 vCPU, 1 GiB RAM, Free Tier eligible
}

variable "desired_size" {
  description = "Desired nodes (1 to stay under 750h/month)"
  type        = number
  default     = 1  # ✅ Single node = 730h/month < 750h Free Tier limit
}

variable "min_size" {
  default = 0  # Allow scale-to-zero when idle
}

variable "max_size" {
  default = 1  # Prevent accidental scaling beyond Free Tier
}

variable "capacity_type" {
  default = "ON_DEMAND"  # Spot not needed for single node
}

# RDS: db.t3.micro (Free Tier eligible)
variable "db_name" {
  default = "b2b_rag_db"
}

variable "db_password" {
  description = "RDS password (use AWS Secrets Manager in prod)"
  type        = string
  sensitive   = true
}

# S3 bucket naming (must be globally unique)
variable "s3_bucket_prefix" {
  description = "Prefix for S3 bucket names (must be unique globally)"
  type        = string
  default     = "b2b-rag-documents"  # Add your unique suffix
}