# infra/terraform/environments/staging/variables.tf

variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "project_name" {
  description = "Project name for tagging"
  type        = string
  default     = "b2b-rag"
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_azs" {
  description = "Availability zones for public subnets"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b"]
}

variable "private_subnet_azs" {
  description = "Availability zones for private subnets"
  type        = list(string)
  default     = ["us-east-1c", "us-east-1d"]
}

variable "node_instance_types" {
  description = "EC2 instance types for EKS nodes"
  type        = list(string)
  default     = ["t3.micro"]
}

variable "desired_size" {
  description = "Desired number of EKS nodes"
  type        = number
  default     = 1
}

variable "min_size" {
  description = "Minimum number of EKS nodes"
  type        = number
  default     = 0
}

variable "max_size" {
  description = "Maximum number of EKS nodes"
  type        = number
  default     = 1
}

variable "capacity_type" {
  description = "EKS node capacity type: ON_DEMAND or SPOT"
  type        = string
  default     = "ON_DEMAND"
}

variable "db_name" {
  description = "RDS database name"
  type        = string
  default     = "b2b_rag_db"
}

variable "db_password" {
  description = "RDS database password (sensitive)"
  type        = string
  sensitive   = true
}