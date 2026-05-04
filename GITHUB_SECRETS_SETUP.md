# GitHub Secrets Setup Guide

This guide walks you through setting up GitHub Actions Secrets for secure CI/CD.

## Why GitHub Secrets?

GitHub Secrets allow you to store sensitive information (API keys, passwords, tokens) securely without committing them to your repository. CI/CD workflows can reference these secrets safely.

## Step-by-Step Setup

### 1. Navigate to Repository Settings

1. Go to your GitHub repository
2. Click **Settings** (top-right area)
3. In the left sidebar, expand **Secrets and variables**
4. Click **Actions**

### 2. Add Required Secrets

Click **New repository secret** and add the following:

#### **DB_PASSWORD** (Required for CI/CD)
- **Name:** `DB_PASSWORD`
- **Value:** A strong password for PostgreSQL testing database
- **Example:** `super-secure-test-password-12345`
- **Used in:** `.github/workflows/ci-cd.yml` → test job

#### **OPENAI_API_KEY** (Required for AI features)
- **Name:** `OPENAI_API_KEY`
- **Value:** Your OpenAI API key
- **Format:** `sk-...`
- **Get it from:** [OpenAI Platform](https://platform.openai.com/api-keys)
- **Used in:** CI/CD tests and production deployment

### 3. (Optional) Add Additional Secrets

Depending on your integrations, also add:

```
ANTHROPIC_API_KEY       → Claude API key
STRIPE_SECRET_KEY       → Stripe payment processing
SENDGRID_API_KEY        → Email notifications
TWILIO_ACCOUNT_SID      → SMS notifications
TWILIO_AUTH_TOKEN       → SMS notifications
SLACK_WEBHOOK_URL       → Slack notifications
PINECONE_API_KEY        → Vector database (production)
AUTH0_CLIENT_SECRET     → Auth0 multi-tenant auth
AWS_ACCESS_KEY_ID       → AWS infrastructure
AWS_SECRET_ACCESS_KEY   → AWS infrastructure
```

## Verify Secrets Are Set Up

Run a workflow and check if secrets are being used:

1. Go to **Actions** tab
2. Click on a recent workflow run
3. Look for ✅ markers next to secret-dependent jobs
4. If you see ❌, check that:
   - Secret name matches exactly (case-sensitive)
   - Secret value is not empty
   - Workflow file uses correct syntax: `${{ secrets.SECRET_NAME }}`

## Best Practices

✅ **DO:**
- Use strong, unique passwords (20+ characters)
- Rotate secrets periodically
- Use environment-specific secrets (`DB_PASSWORD_PROD` vs `DB_PASSWORD_STAGING`)
- Document what each secret is for (in comments)
- Use the minimal scope needed (don't overshare secrets)

❌ **DON'T:**
- Commit `.env` files to git
- Use placeholder values as secrets (they should be real credentials)
- Hardcode secrets in workflow files
- Share secrets via Slack/email
- Use the same secret across dev/staging/prod

## Troubleshooting

**Workflow shows secret value is empty:**
- Double-check the secret name matches exactly (secrets are case-sensitive)
- Verify the secret has a value in Settings

**Getting "Invalid authentication" errors:**
- Make sure the API key is still valid (not expired)
- Check if the API key has the correct permissions

**Locally, secrets don't work:**
- Secrets are only available in GitHub Actions workflows
- For local development, use `.env` file (in `.gitignore`)
- Copy from `.env.example` and fill in real values locally

## Next Steps

1. ✅ Add secrets to GitHub repository
2. ✅ Test by pushing a commit to trigger CI/CD
3. ✅ Monitor workflow run to ensure tests pass
4. ✅ Update `.env.example` with new variables as needed (but never actual values)

For more info, see [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
