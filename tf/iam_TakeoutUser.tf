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
      "arn:aws:chime:us-east-1:005216166247:app-instance/11029a8c-c09e-47c2-aff6-db9515482395/user/$${aws:PrincipalTag/rk_takeout_user_id}",
      "arn:aws:chime:us-east-1:005216166247:app-instance/11029a8c-c09e-47c2-aff6-db9515482395/channel/*",
    ]
  }
  # chat channel
  statement {
    effect = "Allow"
    actions = [
      "chime:SendChannelMessage",
      "chime:RedactChannelMessage",
      "chime:UpdateChannelMessage",
    ]

    resources = [
      "arn:aws:chime:us-east-1:005216166247:app-instance/11029a8c-c09e-47c2-aff6-db9515482395/user/$${aws:PrincipalTag/rk_takeout_user_id}",
      "arn:aws:chime:us-east-1:005216166247:app-instance/11029a8c-c09e-47c2-aff6-db9515482395/channel/392944572afa3858efaf634bc12b511a01a7d3aa1388aa9ab1508dbc9628e693",
      "arn:aws:chime:us-east-1:005216166247:app-instance/11029a8c-c09e-47c2-aff6-db9515482395/channel/d9542baf3d0c8a6aa3a045ca710f1a301bdbdb82dd456f8f84c7f9166a84db9b",
    ]
  }

  # caption channel
  statement {
    effect = "Allow"
    actions = [
      "chime:CreateChannelMembership",
      "chime:DeleteChannelMembership",
    ]

    resources = [
      "arn:aws:chime:us-east-1:${local.aws_account_id}:app-instance/0e09042d-8e87-4b2f-a25b-d71a0e604443/user/$${aws:PrincipalTag/rk_takeout_user_id}",
      "arn:aws:chime:us-east-1:005216166247:app-instance/11029a8c-c09e-47c2-aff6-db9515482395/channel/f785f9f8f243e58d3566b52958534b87ceeeedae11d4b1906e956e375b538ca5",
      "arn:aws:chime:us-east-1:005216166247:app-instance/11029a8c-c09e-47c2-aff6-db9515482395/channel/9b908e352f5e98f9c2992c3fcf02e2fc78faebbda8db39ded97ecd71092191c6",
    ]
  }
}
