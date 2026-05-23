#!/bin/bash
set -e

# Install dependencies and Docker
yum update -y
amazon-linux-extras enable docker
yum install -y docker git
systemctl enable --now docker
usermod -aG docker ec2-user

# Install Docker Compose v2
curl -L "https://github.com/docker/compose/releases/download/v2.22.0/docker-compose-linux-x86_64" \
  -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install AWS CLI v2 (needed for bootstrap verification)
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o /tmp/awscliv2.zip
unzip -q /tmp/awscliv2.zip -d /tmp
/tmp/aws/install
rm -rf /tmp/awscliv2.zip /tmp/aws

mkdir -p /home/ec2-user/app
chown ec2-user:ec2-user /home/ec2-user/app

sudo -u ec2-user bash <<'BOOTSTRAP'
cd /home/ec2-user/app

# Clone or update the repository
if [ -d .git ]; then
  git fetch origin
  git checkout "${repo_branch}"
  git pull origin "${repo_branch}"
else
  git clone --branch "${repo_branch}" "${repo_clone_url}" .
fi

# Write non-sensitive env vars only.
# Sensitive secrets (API keys, DB password, etc.) are fetched from AWS Secrets
# Manager at runtime by the app using the EC2 instance's IAM role — no secrets
# are stored on disk.
cat > .env <<'ENVFILE'
%{ for key, value in env_vars ~}
${key}=${value}
%{ endfor ~}
ENVFILE

echo "Non-sensitive .env written. Secrets will be fetched from AWS Secrets Manager: ${app_secret_name}"

# Start the application stack
docker-compose -f docker-compose.aws.yml up -d --build
BOOTSTRAP
