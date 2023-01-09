resource "aws_ecr_repository" "app" {
  provider = aws.usw2
  name     = "takeout-app"
}

resource "aws_ecr_lifecycle_policy" "app" {
  provider   = aws.usw2
  repository = aws_ecr_repository.app.name
  policy = jsonencode({
    rules = [
      {
        rulePriority = 10
        description  = "expire old images"
        selection = {
          tagStatus   = "any"
          countType   = "imageCountMoreThan"
          countNumber = 10
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}
