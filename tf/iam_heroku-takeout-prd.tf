resource "aws_iam_user" "heroku-takeout-prd" {
  name = "heroku-takeout-prd"
}

data "aws_iam_policy_document" "heroku-takeout-prd" {
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
    ]
  }
}

resource "aws_iam_user_policy" "heroku-takeout-prd" {
  user   = aws_iam_user.heroku-takeout-prd.name
  policy = data.aws_iam_policy_document.heroku-takeout-prd.json
}
