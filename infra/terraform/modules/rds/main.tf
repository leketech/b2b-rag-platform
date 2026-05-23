locals {
  # AWS RDS identifiers only allow lowercase alphanumeric & hyphens
  aws_name = replace(var.db_name, "_", "-")
  
  # PostgreSQL database names allow underscores, NOT hyphens
  pg_db_name = replace(local.aws_name, "-", "_")
}

# 1. Security Group for RDS
resource "aws_security_group" "rds" {
  name        = "${local.aws_name}-sg"
  description = "Allow PostgreSQL access from authorized sources"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    security_groups = var.source_security_group_id != "" ? [var.source_security_group_id] : null
    cidr_blocks     = length(var.source_cidr_blocks) > 0 ? var.source_cidr_blocks : null
    description     = "PostgreSQL ingress"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${local.aws_name}-sg"
  }
}

# 2. DB Subnet Group (RDS requires subnets in at least 2 AZs)
resource "aws_db_subnet_group" "this" {
  name       = "${local.aws_name}-subnet-group"
  subnet_ids = var.db_subnet_ids

  tags = {
    Name = "${local.aws_name}-subnet-group"
  }
}

# 3. Store password in AWS Secrets Manager
resource "aws_secretsmanager_secret" "db_password" {
  name = "${local.aws_name}-password"
}

resource "aws_secretsmanager_secret_version" "db_password" {
  secret_id     = aws_secretsmanager_secret.db_password.id
  secret_string = var.db_password
}

# 4. RDS Instance
resource "aws_db_instance" "this" {
  identifier     = local.aws_name
  engine         = "postgres"
  engine_version = "16"  # ✅ AWS auto-selects latest supported 16.x minor
  instance_class = var.instance_class

  allocated_storage     = 20
  max_allocated_storage = 100
  storage_encrypted     = true
  storage_type          = "gp3"

  db_name  = local.pg_db_name
  username = var.db_username
  password = aws_secretsmanager_secret_version.db_password.secret_string

  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.this.name

  skip_final_snapshot     = var.environment == "staging"
  backup_retention_period = var.environment == "prod" ? 7 : 0
  deletion_protection     = var.environment == "prod"
  publicly_accessible     = false

  tags = {
    Environment = var.environment
    Project     = "b2b-rag"
  }
}