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
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity", "sts:TagSession"]
    principals {
      type = "Federated"
      identifiers = [
        "arn:aws:iam::${local.aws_account_id}:oidc-provider/takeout.rubykaigi.org",
      ]
    }
    condition {
      test     = "StringEquals"
      variable = "takeout.rubykaigi.org:sub"
      values   = ["system:production:takeout-app-user"]
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
      "${data.external.conference.result.production_chime_app_instance_arn}/user/$${aws:PrincipalTag/rk_takeout_user_id}",
      "${data.external.conference.result.production_chime_app_instance_arn}/channel/*",
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

    resources = concat(
      ["${data.external.conference.result.production_chime_app_instance_arn}/user/$${aws:PrincipalTag/rk_takeout_user_id}"],
      split("|#|", data.external.conference.result.production_chime_track_channel_arns),
    )
  }

  # caption channel
  statement {
    effect = "Allow"
    actions = [
      "chime:CreateChannelMembership",
      "chime:DeleteChannelMembership",
    ]

    resources = concat(
      ["${data.external.conference.result.production_chime_app_instance_arn}/user/$${aws:PrincipalTag/rk_takeout_user_id}"],
      split("|#|", data.external.conference.result.production_chime_caption_channel_arns),
    )
  }
}
