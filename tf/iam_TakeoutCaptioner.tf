resource "aws_iam_role" "TakeoutCaptioner" {
  name                 = "TakeoutCaptioner"
  description          = "TakeoutCaptioner"
  assume_role_policy   = data.aws_iam_policy_document.TakeoutCaptioner-trust.json
  max_session_duration = 43200
}

data "aws_iam_policy_document" "TakeoutCaptioner-trust" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]
    principals {
      type = "Service"
      identifiers = [
        "ec2.amazonaws.com",
      ]
    }
  }
}

resource "aws_iam_role_policy" "TakeoutCaptioner" {
  role   = aws_iam_role.TakeoutCaptioner.name
  policy = data.aws_iam_policy_document.TakeoutCaptioner.json
}

data "aws_iam_policy_document" "TakeoutCaptioner" {
  statement {
    effect = "Allow"
    actions = [
      "chime:SendChannelMessage",
      "chime:RedactChannelMessage",
      "chime:UpdateChannelMessage",
    ]

    resources = [
      "arn:aws:chime:us-east-1:${local.aws_account_id}:app-instance/0e09042d-8e87-4b2f-a25b-d71a0e604443/user/app",
      "arn:aws:chime:us-east-1:005216166247:app-instance/11029a8c-c09e-47c2-aff6-db9515482395/user/app",

      "arn:aws:chime:us-east-1:005216166247:app-instance/0e09042d-8e87-4b2f-a25b-d71a0e604443/channel/9f4c6d3dcf1476c72a947e06aa9c6b5ce99e9ec332ea9bc0baac7091def653b9",
      "arn:aws:chime:us-east-1:005216166247:app-instance/0e09042d-8e87-4b2f-a25b-d71a0e604443/channel/42f2ba43b257bfcfcc1c20e889b132e22e89531eec86844d1684eac774ce2e7b",

      "arn:aws:chime:us-east-1:005216166247:app-instance/11029a8c-c09e-47c2-aff6-db9515482395/channel/f785f9f8f243e58d3566b52958534b87ceeeedae11d4b1906e956e375b538ca5", # prd a
      "arn:aws:chime:us-east-1:005216166247:app-instance/11029a8c-c09e-47c2-aff6-db9515482395/channel/9b908e352f5e98f9c2992c3fcf02e2fc78faebbda8db39ded97ecd71092191c6", # prd b
    ]
  }

  statement {
    effect = "Allow"
    actions = [
      "transcribe:StartStreamTranscription*",
      "transcribe:StartStreamTranscriptionWebSocket",
    ]

    resources = [
      "*",
    ]
  }
}

resource "aws_iam_instance_profile" "TakeoutCaptioner" {
  name = aws_iam_role.TakeoutCaptioner.name
  role = aws_iam_role.TakeoutCaptioner.name
}
