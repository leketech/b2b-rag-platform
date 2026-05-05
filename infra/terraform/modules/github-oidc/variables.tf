variable "github_repo" {
  description = "GitHub repository in owner/repo format"
  type        = string
  default     = "leketech/b2b-rag-platform"
}

variable "github_branch" {
  description = "GitHub branch to allow OIDC authentication from"
  type        = string
  default     = "main"
}

variable "github_workflow" {
  description = "Optional: restrict OIDC to specific workflow file"
  type        = string
  default     = ""
}

variable "environment" {
  description = "Environment name for tagging (staging/prod)"
  type        = string
  default     = "staging"
}

variable "project_name" {
  description = "Project name for tagging"
  type        = string
  default     = "b2b-rag"
}

variable "cluster_name" {
  description = "EKS cluster name for policy scoping"
  type        = string
  default     = "b2b-rag-cluster"
}