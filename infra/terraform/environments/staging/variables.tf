variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "staging"
}

variable "project_name" {
  description = "Project identifier"
  type        = string
  default     = "b2b-rag"
}

variable "vpc_cidr" {
  description = "VPC CIDR block"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_azs" {
  description = "AZs for public subnets"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b"]
}

variable "private_subnet_azs" {
  description = "AZs for private subnets"
  type        = list(string)
  default     = ["us-east-1c", "us-east-1d"]
}

variable "db_password" {
  description = "RDS master password (sensitive)"
  type        = string
  sensitive   = true
}

variable "db_name" {
  description = "Name of the RDS instance (lowercase + hyphens)"
  type        = string
}

# ✅ EKS Node Group Configuration (Free Tier Optimized)
variable "node_instance_types" {
  description = "EC2 instance types for EKS worker nodes"
  type        = list(string)
  default     = ["t3.micro"]
}

variable "desired_size" {
  description = "Desired number of EKS worker nodes"
  type        = number
  default     = 1
}

variable "min_size" {
  description = "Minimum number of EKS worker nodes"
  type        = number
  default     = 1
}

variable "max_size" {
  description = "Maximum number of EKS worker nodes"
  type        = number
  default     = 2
}

variable "capacity_type" {
  description = "EKS node capacity type (ON_DEMAND or SPOT)"
  type        = string
  default     = "ON_DEMAND"
}