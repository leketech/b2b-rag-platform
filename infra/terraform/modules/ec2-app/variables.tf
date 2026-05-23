variable "region" {
  description = "AWS region"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "project_name" {
  description = "Project identifier for resources"
  type        = string
  default     = "b2b-rag"
}

variable "public_subnet_id" {
  description = "Public subnet ID where the EC2 instance will be launched"
  type        = string
}

variable "instance_type" {
  description = "EC2 instance type for the application host"
  type        = string
  default     = "t3.micro"
}

variable "ssh_key_name" {
  description = "Optional SSH key pair name for direct instance access"
  type        = string
  default     = ""
}

variable "repo_clone_url" {
  description = "Git repository URL to clone onto the EC2 instance"
  type        = string
  default     = "https://github.com/YOUR_ORG/b2b-rag-platform.git"
}

variable "repo_branch" {
  description = "Git branch to clone"
  type        = string
  default     = "main"
}

variable "env_vars" {
  description = "Map of environment variables to write into the app .env file"
  type        = map(string)
  default     = {}
}

variable "security_group_ids" {
  description = "Security groups attached to the EC2 instance"
  type        = list(string)
  default     = []
}

variable "app_secret_name" {
  description = "AWS Secrets Manager secret name the app fetches at startup (written to .env as APP_SECRET_NAME)"
  type        = string
  default     = ""
}
