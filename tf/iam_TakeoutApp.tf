resource "aws_iam_role" "TakeoutApp" {
  name                 = "TakeoutApp"
  description          = "TakeoutApp"
  assume_role_policy   = data.aws_iam_policy_document.TakeoutApp-trust.json
  max_session_duration = 43200
}

data "aws_iam_policy_document" "TakeoutApp-trust" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]
    principals {
      type = "Service"
      identifiers = [
        "ec2.amazonaws.com",
        "ecs-tasks.amazonaws.com",
        "tasks.apprunner.amazonaws.com",
      ]
    }
  }
}

resource "aws_iam_role_policy" "TakeoutApp" {
  role   = aws_iam_role.TakeoutApp.name
  policy = data.aws_iam_policy_document.takeout-prd.json
}

resource "aws_iam_instance_profile" "TakeoutApp" {
  name = aws_iam_role.TakeoutApp.name
  role = aws_iam_role.TakeoutApp.name
}
