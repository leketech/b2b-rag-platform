output "secret_arn" {
  description = "ARN of the app secrets Secrets Manager secret"
  value       = aws_secretsmanager_secret.app_secrets.arn
}

output "secret_name" {
  description = "Name of the app secrets Secrets Manager secret"
  value       = aws_secretsmanager_secret.app_secrets.name
}

output "irsa_role_arn" {
  description = "ARN of the IRSA IAM role to annotate the Kubernetes service account with"
  value       = aws_iam_role.app_irsa.arn
}
