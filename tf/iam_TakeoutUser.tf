resource "aws_iam_role" "TakeoutUser" {
  name                 = "TakeoutUser"
  description          = "TakeoutUser"
  assume_role_policy   = data.aws_iam_policy_document.TakeoutUser-trust.json
  max_session_duration = 43200
}

data "aws_iam_policy_document" "TakeoutUser-trust" {
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

resource "aws_iam_role_policy" "TakeoutUser" {
  role   = aws_iam_role.TakeoutUser.name
  policy = data.aws_iam_policy_document.TakeoutUser.json
}

data "aws_iam_policy_document" "TakeoutUser" {
  statement {
    effect    = "Allow"
    actions   = ["chime:GetMessagingSessionEndpoint"]
    resources = ["*"]
  }
  statement {
    effect = "Allow"
    actions = [
      "chime:SendChannelMessage",
      "chime:ListChannelMessages",
      "chime:CreateChannelMembership",
      "chime:ListChannelMemberships",
      "chime:DeleteChannelMembership",
      "chime:CreateChannelModerator",
      "chime:ListChannelModerators",
      "chime:DescribeChannelModerator",
      "chime:CreateChannel",
      "chime:DescribeChannel",
      "chime:ListChannels",
      "chime:DeleteChannel",
      "chime:RedactChannelMessage",
      "chime:UpdateChannelMessage",
      "chime:Connect",
      "chime:ListChannelBans",
      "chime:CreateChannelBan",
      "chime:DeleteChannelBan",
      "chime:ListChannelMembershipsForAppInstanceUser"
    ]

    resources = [
      // rk_takeout_user_id is expected to be given on sts:AssumeRole
      "arn:aws:chime:us-east-1:${local.aws_account_id}:app-instance/0e09042d-8e87-4b2f-a25b-d71a0e604443/user/$${aws:PrincipalTag/rk_takeout_user_id}",
      "arn:aws:chime:us-east-1:005216166247:app-instance/0e09042d-8e87-4b2f-a25b-d71a0e604443/channel/*",
    ]
  }
}
