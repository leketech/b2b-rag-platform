output "app_host_public_ip" {
  description = "Public IP address of the free-tier EC2 app host"
  value       = module.app_host.instance_public_ip
}

output "app_host_public_dns" {
  description = "Public DNS of the free-tier EC2 app host"
  value       = module.app_host.instance_public_dns
}

output "db_endpoint" {
  description = "RDS endpoint (reused from staging environment)"
  value       = data.aws_db_instance.existing.endpoint
}

output "app_secret_name" {
  description = "AWS Secrets Manager secret name for app secrets"
  value       = aws_secretsmanager_secret.app_secrets.name
}
