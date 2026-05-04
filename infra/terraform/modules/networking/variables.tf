variable "region" {
  description = "AWS region"
  type        = string
}

variable "environment" {
  description = "Environment name (staging/prod)"
  type        = string
}

variable "project_name" {
  description = "Project identifier for resource naming"
  type        = string
  default     = "b2b-rag"
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_azs" {
  description = "List of AZs for public subnets (min 2 for HA)"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b"]
}

variable "private_subnet_azs" {
  description = "List of AZs for private subnets (min 2 for HA)"
  type        = list(string)
  default     = ["us-east-1c", "us-east-1d"]
}