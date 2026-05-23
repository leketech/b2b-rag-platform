data "aws_ami" "amazon_linux" {
  most_recent = true

  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }

  filter {
    name   = "architecture"
    values = ["x86_64"]
  }

  owners = ["amazon"]
}

resource "aws_iam_role" "ec2" {
  name               = "${var.project_name}-${var.environment}-ec2-role"
  assume_role_policy = data.aws_iam_policy_document.ec2_assume_role.json
}

data "aws_iam_policy_document" "ec2_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

resource "aws_iam_role_policy_attachment" "ssm" {
  role       = aws_iam_role.ec2.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

# Allow the EC2 instance (and Docker containers running on it) to read secrets
# from Secrets Manager. Docker containers inherit EC2 credentials via IMDS.
resource "aws_iam_role_policy" "secrets_manager" {
  name = "${var.project_name}-${var.environment}-read-secrets"
  role = aws_iam_role.ec2.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "secretsmanager:GetSecretValue",
        "secretsmanager:DescribeSecret",
      ]
      # Scoped to all b2b-rag secrets; adjust to a specific ARN for tighter control
      Resource = "arn:aws:secretsmanager:*:*:secret:b2b-rag/*"
    }]
  })
}

resource "aws_iam_instance_profile" "ec2" {
  name = "${var.project_name}-${var.environment}-ec2-profile"
  role = aws_iam_role.ec2.name
}

resource "aws_instance" "app_host" {
  ami                         = data.aws_ami.amazon_linux.id
  instance_type               = var.instance_type
  subnet_id                   = var.public_subnet_id
  associate_public_ip_address = true
  iam_instance_profile        = aws_iam_instance_profile.ec2.name
  vpc_security_group_ids      = var.security_group_ids
  key_name                    = var.ssh_key_name != "" ? var.ssh_key_name : null

  # IMDSv2 with hop limit = 2 so Docker containers can reach the metadata
  # endpoint (each Docker bridge network adds one hop).
  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required"
    http_put_response_hop_limit = 2
  }

  user_data = templatefile("${path.module}/user_data.sh.tpl", {
    repo_clone_url  = var.repo_clone_url
    repo_branch     = var.repo_branch
    env_vars        = var.env_vars
    app_secret_name = var.app_secret_name
  })

  tags = {
    Name        = "${var.project_name}-${var.environment}-app-host"
    Environment = var.environment
    Project     = var.project_name
  }
}
