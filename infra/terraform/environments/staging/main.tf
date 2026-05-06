# infra/terraform/environments/staging/main.tf
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"  # ← Changed from ~> 5.0 to match existing state
    }
    # Remove kubernetes/helm if not used elsewhere
  }

  backend "s3" {
    bucket         = "b2b-rag-terraform-state"
    key            = "staging/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    # ⚠️ dynamodb_table is deprecated but still works:
    dynamodb_table = "b2b-rag-terraform-locks"
  }
}

provider "aws" {
  region = var.region
  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

module "networking" {
  source             = "../../modules/networking"
  region             = var.region
  environment        = var.environment
  project_name       = var.project_name
  vpc_cidr           = var.vpc_cidr
  public_subnet_azs  = var.public_subnet_azs
  private_subnet_azs = var.private_subnet_azs
}

module "eks" {
  source              = "../../modules/eks"
  cluster_name        = "b2b-rag-cluster"
  subnet_ids          = module.networking.private_subnet_ids
  node_instance_types = var.node_instance_types
  desired_size        = var.desired_size
  min_size            = var.min_size
  max_size            = var.max_size
  capacity_type       = var.capacity_type
  environment         = var.environment
  github_actions_role_arn = module.github_oidc.role_arn
}

module "rds" {
  source                        = "../../modules/rds"
  db_name                       = var.db_name
  db_password                   = var.db_password
  vpc_id                        = module.networking.vpc_id
  db_subnet_ids                 = module.networking.private_subnet_ids
  eks_cluster_security_group_id = module.eks.cluster_security_group_id
  environment                   = var.environment
}

module "s3" {
  source      = "../../modules/s3"
  bucket_name = "b2b-rag-documents-${var.environment}"
  environment = var.environment
}

module "github_oidc" {
  source        = "../../modules/github-oidc"
  github_branch = "*"
}