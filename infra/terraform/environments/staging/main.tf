# ✅ Provider configured ONLY at root level
provider "aws" {
  region = var.region
}

module "networking" {
  source = "../../modules/networking"

  region             = var.region
  environment        = var.environment
  project_name       = var.project_name
  vpc_cidr           = var.vpc_cidr
  public_subnet_azs  = var.public_subnet_azs
  private_subnet_azs = var.private_subnet_azs
}

module "eks" {
  source       = "../../modules/eks"
  cluster_name = "b2b-rag-cluster"
  subnet_ids   = module.networking.private_subnet_ids

  # ✅ Pass through root variables
  node_instance_types = var.node_instance_types
  desired_size        = var.desired_size
  min_size            = var.min_size
  max_size            = var.max_size
  capacity_type       = var.capacity_type
  environment         = var.environment
}

module "rds" {
  source = "../../modules/rds"

  # ✅ Use the root variable instead of hardcoding
  db_name                       = var.db_name
  db_password                   = var.db_password
  vpc_id                        = module.networking.vpc_id
  db_subnet_ids                 = module.networking.private_subnet_ids
  eks_cluster_security_group_id = module.eks.cluster_security_group_id
  environment                   = var.environment
}

module "s3" {
  source = "../../modules/s3"

  bucket_name = "b2b-rag-documents-${var.environment}"
  environment = var.environment
}

module "github_oidc" {
  source = "../../modules/github-oidc"
}