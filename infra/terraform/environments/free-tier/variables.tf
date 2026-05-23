variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "free-tier"
}

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
  default     = "b2b-rag"
}

variable "s3_bucket_prefix" {
  description = "Prefix for the S3 bucket name"
  type        = string
  default     = "b2b-rag-documents"
}

variable "repo_clone_url" {
  description = "Git repository URL to clone onto EC2"
  type        = string
  default     = "https://github.com/leketech/b2b-rag-platform.git"
}

variable "repo_branch" {
  description = "Git branch to deploy"
  type        = string
  default     = "main"
}

variable "ssh_key_name" {
  description = "Optional SSH key pair name for EC2 access"
  type        = string
  default     = ""
}
