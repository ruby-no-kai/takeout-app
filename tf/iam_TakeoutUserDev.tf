resource "aws_iam_role" "TakeoutUserDev" {
  name                 = "TakeoutUserDev"
  description          = "TakeoutUserDev"
  assume_role_policy   = data.aws_iam_policy_document.TakeoutUserDev-trust.json
  max_session_duration = 43200
}

data "aws_iam_policy_document" "TakeoutUserDev-trust" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole", "sts:TagSession"]
    principals {
      type = "AWS"
      identifiers = [
        "arn:aws:iam::${local.aws_account_id}:root",
      ]
    }
  }
}

resource "aws_iam_role_policy" "TakeoutUserDev" {
  role   = aws_iam_role.TakeoutUserDev.name
  policy = data.aws_iam_policy_document.TakeoutUserDev.json
}

data "aws_iam_policy_document" "TakeoutUserDev" {
  statement {
    effect    = "Allow"
    actions   = ["chime:GetMessagingSessionEndpoint"]
    resources = ["*"]
  }
  statement {
    effect = "Allow"
    actions = [
      #"chime:SendChannelMessage",
      "chime:ListChannelMessages",
      #"chime:CreateChannelMembership",
      #"chime:ListChannelMemberships",
      #"chime:DeleteChannelMembership",
      #"chime:CreateChannelModerator",
      "chime:ListChannelModerators",
      "chime:DescribeChannelModerator",
      #"chime:CreateChannel",
      "chime:DescribeChannel",
      "chime:ListChannels",
      #"chime:DeleteChannel",
      #"chime:RedactChannelMessage",
      #"chime:UpdateChannelMessage",
      "chime:Connect",
      "chime:ListChannelBans",
      #"chime:CreateChannelBan",
      #"chime:DeleteChannelBan",
      #"chime:ListChannelMembershipsForAppInstanceUser"
    ]

    resources = [
      // rk_takeout_user_id is expected to be given on sts:AssumeRole
      "arn:aws:chime:us-east-1:${local.aws_account_id}:app-instance/0e09042d-8e87-4b2f-a25b-d71a0e604443/user/$${aws:PrincipalTag/rk_takeout_user_id}",
      "arn:aws:chime:us-east-1:005216166247:app-instance/0e09042d-8e87-4b2f-a25b-d71a0e604443/channel/*",
    ]
  }
  statement {
    effect = "Allow"
    actions = [
      "chime:SendChannelMessage",
      "chime:RedactChannelMessage",
      "chime:UpdateChannelMessage",
    ]

    resources = [
      "arn:aws:chime:us-east-1:${local.aws_account_id}:app-instance/0e09042d-8e87-4b2f-a25b-d71a0e604443/user/$${aws:PrincipalTag/rk_takeout_user_id}",
      "arn:aws:chime:us-east-1:005216166247:app-instance/0e09042d-8e87-4b2f-a25b-d71a0e604443/channel/cf0d6a1f32cc876c68eab23e90399de0da627ed027ab6f2159b0f8087dd7facd",
      "arn:aws:chime:us-east-1:005216166247:app-instance/0e09042d-8e87-4b2f-a25b-d71a0e604443/channel/1dee0cf699e51df2910a69398ea41b262a52213a654781c8e386d257a7844f5b",
    ]
  }
  statement {
    effect = "Allow"
    actions = [
      "chime:CreateChannelMembership",
      "chime:DeleteChannelMembership",
    ]

    resources = [
      "arn:aws:chime:us-east-1:${local.aws_account_id}:app-instance/0e09042d-8e87-4b2f-a25b-d71a0e604443/user/$${aws:PrincipalTag/rk_takeout_user_id}",
      "arn:aws:chime:us-east-1:005216166247:app-instance/0e09042d-8e87-4b2f-a25b-d71a0e604443/channel/9f4c6d3dcf1476c72a947e06aa9c6b5ce99e9ec332ea9bc0baac7091def653b9",
      "arn:aws:chime:us-east-1:005216166247:app-instance/0e09042d-8e87-4b2f-a25b-d71a0e604443/channel/42f2ba43b257bfcfcc1c20e889b132e22e89531eec86844d1684eac774ce2e7b",
    ]
  }
}
