resource "aws_iam_user" "heroku-takeout-prd" {
  name = "heroku-takeout-prd"
}

data "aws_iam_policy_document" "takeout-prd" {
  statement {
    effect = "Allow"
    actions = [
      "sts:AssumeRole",
    ]
    resources = [
      aws_iam_role.TakeoutUser.arn,
      aws_iam_role.TakeoutUserDev.arn,
    ]
  }

  statement {
    effect = "Allow"
    actions = [
      "s3:GetObject",
      "s3:PutObject",
    ]
    resources = [
      "${aws_s3_bucket.rk-takeout-app.arn}/prd/*"
    ]
  }

  statement {
    effect = "Allow"
    actions = [
      "sts:TagSession"
    ]
    resources = [
      aws_iam_role.TakeoutUser.arn,
      aws_iam_role.TakeoutUserDev.arn,
    ]

    condition {
      test     = "StringLike"
      variable = "aws:RequestTag/rk_takeout_user_id"
      values   = ["*"]
    }
  }

  statement {
    effect = "Allow"
    actions = [
      "chime:SendChannelMessage",
      "chime:DeleteChannelMessage",
      "chime:ListChannelMessages",
      "chime:CreateChannelMembership",
      "chime:ListChannelMemberships",
      "chime:DeleteChannelMembership",
      "chime:CreateChannelModerator",
      "chime:ListChannelModerators",
      "chime:DescribeChannelModerator",
      "chime:DescribeChannel",
      "chime:ListChannels",
      "chime:RedactChannelMessage",
      "chime:UpdateChannelMessage",
      "chime:Connect",
      "chime:ListChannelBans",
      "chime:CreateChannelBan",
      "chime:DeleteChannelBan",
      "chime:ListChannelMembershipsForAppInstanceUser",

      "chime:CreateAppInstanceUser",
      "chime:UpdateAppInstanceUser",
    ]

    resources = [
      "arn:aws:chime:us-east-1:${local.aws_account_id}:app-instance/0e09042d-8e87-4b2f-a25b-d71a0e604443/*", #dev
      "arn:aws:chime:us-east-1:005216166247:app-instance/11029a8c-c09e-47c2-aff6-db9515482395/*",            #prd
    ]
  }

  statement {
    effect = "Allow"
    actions = [
      "ivs:PutMetadata",
      "ivs:GetStream",
    ]
    resources = [
      "arn:aws:ivs:us-west-2:005216166247:channel/oTssPyKzhjoS", # dev

      "arn:aws:ivs:us-west-2:005216166247:channel/VvM44QACk0cP", # prd a
      "arn:aws:ivs:us-west-2:005216166247:channel/lxVf1pHuVdbU", # prd b
      "arn:aws:ivs:us-west-2:005216166247:channel/BqJ6JEV7iJUt", # prd interpret
    ]
  }

  statement {
    effect = "Allow"
    actions = [
      "sqs:ChangeMessageVisibility",
      "sqs:ChangeMessageVisibilityBatch",
      "sqs:DeleteMessage",
      "sqs:DeleteMessageBatch",
      "sqs:GetQueueAttributes",
      "sqs:GetQueueUrl",
      "sqs:ReceiveMessage",
      "sqs:SendMessage",
      "sqs:SendMessageBatch",
      "sqs:ListQueues",
    ]
    resources = [
      aws_sqs_queue.activejob-prd.arn,
      aws_sqs_queue.activejob-dlq-prd.arn,
    ]
  }

}

resource "aws_iam_policy" "heroku-takeout-prd" {
  name   = "takeout-prd"
  policy = data.aws_iam_policy_document.takeout-prd.json
}

resource "aws_iam_user_policy_attachment" "heroku-takeout-prd" {
  user       = aws_iam_user.heroku-takeout-prd.name
  policy_arn = aws_iam_policy.heroku-takeout-prd.arn
}
