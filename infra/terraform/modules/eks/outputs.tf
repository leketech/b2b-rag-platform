output "cluster_name" {
  description = "Name of the EKS cluster"
  value       = aws_eks_cluster.this.name
}

output "cluster_endpoint" {
  description = "EKS cluster API endpoint"
  value       = aws_eks_cluster.this.endpoint
  sensitive   = true
}

output "cluster_ca_data" {
  description = "Certificate authority data for the cluster"
  value       = aws_eks_cluster.this.certificate_authority[0].data
  sensitive   = true
}

output "cluster_security_group_id" {
  description = "Security group ID automatically created for the EKS control plane"
  value       = aws_eks_cluster.this.vpc_config[0].cluster_security_group_id
}

output "node_group_arn" {
  description = "ARN of the managed node group"
  value       = aws_eks_node_group.this.arn
}