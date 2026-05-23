terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
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

# =============================================================================
# Reuse the existing RDS instance (created by the staging environment).
# Creating a second db.t3.micro would exceed free-tier hours.
# =============================================================================
data "aws_db_instance" "existing" {
  db_instance_identifier = "b2b-rag-db"
}

data "aws_secretsmanager_secret_version" "db_password" {
  secret_id = "b2b-rag-db-password"
}

locals {
  # RDS endpoint is "host:port" — split to get just the host
  db_host      = split(":", data.aws_db_instance.existing.endpoint)[0]
  db_password  = data.aws_secretsmanager_secret_version.db_password.secret_string
  database_url = "postgresql+asyncpg://postgres:${local.db_password}@${local.db_host}:5432/b2b_rag_db"

  # Redis runs as a sidecar container in docker-compose.aws.yml
  redis_url = "redis://redis:6379/0"
}

# =============================================================================
# App-level Secrets Manager secret
# Terraform populates DATABASE_URL and Redis URLs on first apply.
# All other API keys must be populated manually after provisioning:
#   aws secretsmanager put-secret-value \
#     --secret-id b2b-rag/free-tier/app-secrets \
#     --secret-string "$(aws secretsmanager get-secret-value \
#         --secret-id b2b-rag/free-tier/app-secrets \
#         --query SecretString --output text | \
#       python3 -c "import json,sys; d=json.load(sys.stdin); d.update({'OPENAI_API_KEY':'sk-...','JWT_SECRET_KEY':'...'}); print(json.dumps(d))")"
# =============================================================================
resource "aws_secretsmanager_secret" "app_secrets" {
  name                    = "b2b-rag/free-tier/app-secrets"
  description             = "All sensitive app configuration for b2b-rag free-tier"
  recovery_window_in_days = 0  # Allow immediate deletion on terraform destroy
}

resource "aws_secretsmanager_secret_version" "app_secrets" {
  secret_id = aws_secretsmanager_secret.app_secrets.id

  secret_string = jsonencode({
    # ── Database (populated by Terraform from existing staging RDS) ───────────
    DATABASE_URL = local.database_url

    # ── Cache / Queue (Redis sidecar in docker-compose) ───────────────────────
    REDIS_URL             = local.redis_url
    CELERY_BROKER_URL     = "redis://redis:6379/1"
    CELERY_RESULT_BACKEND = "redis://redis:6379/2"

    # ── LLM — populate manually ───────────────────────────────────────────────
    OPENAI_API_KEY    = ""
    ANTHROPIC_API_KEY = ""

    # ── Auth — populate manually ──────────────────────────────────────────────
    JWT_SECRET_KEY = ""

    # ── Google OAuth — populate manually ──────────────────────────────────────
    GOOGLE_CLIENT_ID     = ""
    GOOGLE_CLIENT_SECRET = ""

    # ── Payments — populate manually ──────────────────────────────────────────
    STRIPE_SECRET_KEY     = ""
    STRIPE_WEBHOOK_SECRET = ""

    # ── Notifications — populate manually ─────────────────────────────────────
    SENDGRID_API_KEY   = ""
    TWILIO_ACCOUNT_SID = ""
    TWILIO_AUTH_TOKEN  = ""
    SLACK_BOT_TOKEN    = ""

    # ── Scheduling — populate manually ────────────────────────────────────────
    CALCOM_API_KEY = ""

    # ── Vector store — populate manually ──────────────────────────────────────
    PINECONE_API_KEY = ""
  })

  # Never overwrite manually-populated API keys on subsequent terraform applies
  lifecycle {
    ignore_changes = [secret_string]
  }
}

# =============================================================================
# Networking — no NAT Gateway (free tier; EC2 is in a public subnet)
# =============================================================================
module "networking" {
  source             = "../../modules/networking"
  region             = var.region
  environment        = var.environment
  project_name       = var.project_name
  vpc_cidr           = "10.0.0.0/16"
  public_subnet_azs  = ["${var.region}a", "${var.region}b"]
  private_subnet_azs = ["${var.region}a", "${var.region}b"]
  create_nat_gateway = false
}

# =============================================================================
# Security Group for the EC2 app host
# =============================================================================
resource "aws_security_group" "app_host" {
  name        = "${var.project_name}-${var.environment}-app-sg"
  description = "HTTP, HTTPS, API, and SSH ingress for the free-tier app host"
  vpc_id      = module.networking.vpc_id

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "FastAPI"
    from_port   = 8000
    to_port     = 8000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Next.js"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-app-sg"
  }
}

# =============================================================================
# EC2 t3.micro app host (free tier: 750 hrs/month)
# Only non-sensitive env vars go here; secrets are fetched from Secrets Manager
# =============================================================================
module "app_host" {
  source             = "../../modules/ec2-app"
  region             = var.region
  environment        = var.environment
  project_name       = var.project_name
  public_subnet_id   = module.networking.public_subnet_ids[0]
  security_group_ids = [aws_security_group.app_host.id]
  instance_type      = "t3.micro"
  ssh_key_name       = var.ssh_key_name
  repo_clone_url     = var.repo_clone_url
  repo_branch        = var.repo_branch
  app_secret_name    = aws_secretsmanager_secret.app_secrets.name

  env_vars = {
    ENVIRONMENT        = "staging"
    APP_SECRET_NAME    = aws_secretsmanager_secret.app_secrets.name
    AWS_DEFAULT_REGION = var.region
    LOG_LEVEL          = "INFO"
    S3_BUCKET_NAME     = "${var.s3_bucket_prefix}-${var.environment}"
    API_BASE_URL       = "http://localhost:8000"
    FRONTEND_URL       = "http://localhost:3000"
    CORS_ORIGINS       = "http://localhost:3000"
  }

  depends_on = [aws_secretsmanager_secret_version.app_secrets]
}

# =============================================================================
# S3 bucket for document storage (5 GB free tier)
# =============================================================================
module "s3" {
  source      = "../../modules/s3"
  bucket_name = "${var.s3_bucket_prefix}-${var.environment}"
  environment = var.environment
}
