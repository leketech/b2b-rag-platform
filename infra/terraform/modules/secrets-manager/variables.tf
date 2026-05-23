variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

variable "environment" {
  description = "Environment name (staging, production)"
  type        = string
}

variable "oidc_provider_arn" {
  description = "ARN of the EKS OIDC provider (from eks module output)"
  type        = string
}

variable "oidc_provider_url" {
  description = "OIDC provider URL without https:// (from eks module output)"
  type        = string
}

variable "k8s_namespace" {
  description = "Kubernetes namespace where the app service account lives"
  type        = string
  default     = "default"
}

variable "k8s_service_account" {
  description = "Kubernetes service account name that will assume the IRSA role"
  type        = string
  default     = "b2b-rag-api"
}

variable "db_secret_arn" {
  description = "ARN of the existing RDS password secret (from rds module output)"
  type        = string
}
