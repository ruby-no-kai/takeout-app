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

    resources = concat(
      [
        data.external.conference.result.development_chime_app_user_arn,
        data.external.conference.result.production_chime_app_user_arn,
      ],
      split("|#|", data.external.conference.result.development_chime_caption_channel_arns),
      split("|#|", data.external.conference.result.production_chime_caption_channel_arns),
    )
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

  statement {
    effect = "Allow"
    actions = [
      "ecr:GetAuthorizationToken",
      "sts:GetServiceBearerToken",
    ]
    resources = ["*"]
  }
  statement {
    effect = "Allow"
    actions = [
      "ecr:GetDownloadUrlForLayer",
      "ecr:BatchCheckLayerAvailability",
      "ecr:BatchGetImage",
      "ecr:DescribeImages",
    ]
    resources = [
      aws_ecr_repository.app.arn,
    ]
  }
}

resource "aws_iam_instance_profile" "TakeoutCaptioner" {
  name = aws_iam_role.TakeoutCaptioner.name
  role = aws_iam_role.TakeoutCaptioner.name
}
