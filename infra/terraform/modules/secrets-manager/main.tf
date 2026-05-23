# infra/terraform/modules/secrets-manager/main.tf
# =============================================================================
# AWS Secrets Manager: App secrets + IRSA role for pod access
# =============================================================================

locals {
  secret_name = "${var.project_name}/${var.environment}/app-secrets"
}

# =============================================================================
# App Secrets (single JSON document for all sensitive config)
# Populate values via AWS Console or CLI after provisioning:
#   aws secretsmanager put-secret-value \
#     --secret-id b2b-rag/staging/app-secrets \
#     --secret-string '{"OPENAI_API_KEY":"sk-...","JWT_SECRET_KEY":"...",...}'
# =============================================================================
resource "aws_secretsmanager_secret" "app_secrets" {
  name                    = local.secret_name
  description             = "All sensitive app secrets for ${var.project_name} ${var.environment}"
  recovery_window_in_days = 7

  tags = {
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

resource "aws_secretsmanager_secret_version" "app_secrets_placeholder" {
  secret_id = aws_secretsmanager_secret.app_secrets.id

  secret_string = jsonencode({
    # ── LLM ──────────────────────────────────────────
    OPENAI_API_KEY    = ""
    ANTHROPIC_API_KEY = ""

    # ── Auth ─────────────────────────────────────────
    JWT_SECRET_KEY = ""

    # ── Google OAuth ─────────────────────────────────
    GOOGLE_CLIENT_ID     = ""
    GOOGLE_CLIENT_SECRET = ""

    # ── Vector Store ─────────────────────────────────
    PINECONE_API_KEY = ""

    # ── Payments ─────────────────────────────────────
    STRIPE_SECRET_KEY     = ""
    STRIPE_WEBHOOK_SECRET = ""

    # ── Notifications ────────────────────────────────
    SENDGRID_API_KEY  = ""
    TWILIO_ACCOUNT_SID = ""
    TWILIO_AUTH_TOKEN  = ""
    SLACK_BOT_TOKEN   = ""

    # ── Scheduling ───────────────────────────────────
    CALCOM_API_KEY = ""

    # ── Database (set after RDS is provisioned) ───────
    DATABASE_URL = ""

    # ── Cache / Queue (set after Redis is provisioned) ─
    REDIS_URL            = ""
    CELERY_BROKER_URL    = ""
    CELERY_RESULT_BACKEND = ""
  })

  # Never overwrite manually-set secret values on subsequent applies
  lifecycle {
    ignore_changes = [secret_string]
  }
}

# =============================================================================
# IAM Policy: allow reading the app secrets document
# =============================================================================
resource "aws_iam_policy" "read_app_secrets" {
  name        = "${var.project_name}-${var.environment}-read-app-secrets"
  description = "Allow reading ${local.secret_name} from Secrets Manager"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret",
        ]
        Resource = aws_secretsmanager_secret.app_secrets.arn
      },
      # Also allow reading the RDS password secret (used to construct DATABASE_URL)
      {
        Effect   = "Allow"
        Action   = ["secretsmanager:GetSecretValue"]
        Resource = var.db_secret_arn
      },
    ]
  })
}

# =============================================================================
# IRSA Role: trusted by the Kubernetes service account via OIDC
# =============================================================================
data "aws_iam_policy_document" "irsa_assume_role" {
  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]
    effect  = "Allow"

    principals {
      type        = "Federated"
      identifiers = [var.oidc_provider_arn]
    }

    condition {
      test     = "StringEquals"
      variable = "${var.oidc_provider_url}:sub"
      values   = ["system:serviceaccount:${var.k8s_namespace}:${var.k8s_service_account}"]
    }

    condition {
      test     = "StringEquals"
      variable = "${var.oidc_provider_url}:aud"
      values   = ["sts.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "app_irsa" {
  name               = "${var.project_name}-${var.environment}-app-irsa"
  assume_role_policy = data.aws_iam_policy_document.irsa_assume_role.json

  tags = {
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

resource "aws_iam_role_policy_attachment" "app_irsa_secrets" {
  role       = aws_iam_role.app_irsa.name
  policy_arn = aws_iam_policy.read_app_secrets.arn
}
