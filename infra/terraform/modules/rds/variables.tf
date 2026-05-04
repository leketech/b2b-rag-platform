variable "db_name" {
  description = "Name of the RDS instance (lowercase letters, numbers, and hyphens only)"
  type        = string

  validation {
    condition     = can(regex("^[a-z][a-z0-9-]*$", var.db_name))
    error_message = "db_name must start with a lowercase letter and contain only lowercase letters, numbers, and hyphens."
  }
}

variable "db_username" {
  description = "Master username for the database"
  type        = string
  default     = "postgres"

  validation {
    condition     = can(regex("^[a-zA-Z][a-zA-Z0-9_]*$", var.db_username))
    error_message = "db_username must start with a letter and contain only letters, numbers, and underscores."
  }
}

variable "db_password" {
  description = "Master password (sensitive)"
  type        = string
  sensitive   = true

  validation {
    # AWS RDS forbids: /, @, ", ', and space. Must be 8-41 chars.
    condition     = length(var.db_password) >= 8 && length(var.db_password) <= 41 && can(regex("^[A-Za-z0-9!#$%&*()+.^_~\\-]{8,41}$", var.db_password))
    error_message = "Password must be 8-41 characters and can only contain letters, numbers, and ! # $ % & * ( ) + - . ^ _ ~. No spaces, /, @, \", or ' allowed."
  }
}

variable "vpc_id" {
  description = "VPC ID where RDS will be deployed"
  type        = string

  validation {
    condition     = can(regex("^vpc-[0-9a-f]{8,17}$", var.vpc_id))
    error_message = "vpc_id must be a valid AWS VPC ID format (e.g., vpc-0123456789abcdef0)."
  }
}

variable "db_subnet_ids" {
  description = "List of private subnet IDs for RDS (min 2 AZs)"
  type        = list(string)

  validation {
    condition     = length(var.db_subnet_ids) >= 2
    error_message = "RDS requires at least 2 subnets across different Availability Zones."
  }
}

variable "eks_cluster_security_group_id" {
  description = "Security group ID of the EKS cluster to allow ingress"
  type        = string

  validation {
    condition     = can(regex("^sg-[0-9a-f]{8,17}$", var.eks_cluster_security_group_id))
    error_message = "eks_cluster_security_group_id must be a valid AWS security group ID format (e.g., sg-0123456789abcdef0)."
  }
}

variable "environment" {
  description = "Environment name (staging/prod)"
  type        = string

  validation {
    condition     = contains(["dev", "staging", "prod", "uat"], var.environment)
    error_message = "environment must be one of: dev, staging, prod, uat."
  }
}

variable "instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"

  validation {
    # Matches any valid AWS RDS instance format: db.FAMILY.SIZE
    condition     = can(regex("^db\\.[a-z0-9]+\\.[a-z0-9]+$", var.instance_class))
    error_message = "instance_class must be a valid RDS instance class format (e.g., db.t3.micro, db.r5.large)."
  }
}