resource "aws_sqs_queue" "activejob-prd" {
  provider = aws.use1
  name     = "takeout-app-activejob-prd"

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.activejob-dlq-prd.arn
    maxReceiveCount     = 10
  })

  tags = {
    Environment = "production"
  }
}


resource "aws_sqs_queue" "activejob-dlq-prd" {
  provider = aws.use1
  name     = "takeout-app-activejob-dlq-prd"

  tags = {
    Environment = "production"
  }
}
