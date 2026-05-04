resource "aws_ecr_repository" "api" {
  name                 = var.repo_name
  image_tag_mutability = "MUTABLE"  # Use IMMUTABLE in prod

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Environment = var.environment
    Project     = "b2b-rag"
  }
}

# Optional: Lifecycle policy to clean old images
resource "aws_ecr_lifecycle_policy" "api" {
  repository = aws_ecr_repository.api.name
  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Keep last 10 images"
      selection = {
        tagStatus   = "any"
        countType   = "imageCountMoreThan"
        countNumber = 10
      }
      action = {
        type = "expire"
      }
    }]
  })
}