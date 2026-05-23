output "instance_id" {
  description = "EC2 instance ID for the app host"
  value       = aws_instance.app_host.id
}

output "instance_public_ip" {
  description = "Public IP address of the EC2 app host"
  value       = aws_instance.app_host.public_ip
}

output "instance_public_dns" {
  description = "Public DNS name of the EC2 app host"
  value       = aws_instance.app_host.public_dns
}
