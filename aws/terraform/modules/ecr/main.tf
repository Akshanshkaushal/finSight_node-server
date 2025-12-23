# ECR Repositories for each service
resource "aws_ecr_repository" "services" {
  for_each = toset(var.services)

  name                 = "${var.project_name}-${var.environment}-${each.key}"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  encryption_configuration {
    encryption_type = "AES256"
  }

  lifecycle_policy {
    policy = jsonencode({
      rules = [
        {
          rulePriority = 1
          description  = "Keep last 10 images"
          selection = {
            tagStatus     = "any"
            countType     = "imageCountMoreThan"
            countNumber   = 10
          }
          action = {
            type = "expire"
          }
        }
      ]
    })
  }

  tags = {
    Name    = "${var.project_name}-${var.environment}-${each.key}"
    Service = each.key
  }
}

# Outputs
output "repository_urls" {
  value = {
    for k, v in aws_ecr_repository.services : k => v.repository_url
  }
}

output "repository_arns" {
  value = {
    for k, v in aws_ecr_repository.services : k => v.arn
  }
}

