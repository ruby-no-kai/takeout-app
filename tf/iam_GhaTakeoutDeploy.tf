resource "aws_iam_role" "GhaTakeoutDeploy" {
  name                 = "GhaTakeoutDeploy"
  assume_role_policy   = data.aws_iam_policy_document.GhaTakeoutDeploy-trust.json
  max_session_duration = 3600 * 4
}

data "aws_iam_policy_document" "GhaTakeoutDeploy-trust" {
  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]
    effect  = "Allow"
    principals {
      type        = "Federated"
      identifiers = [data.aws_iam_openid_connect_provider.github-actions.arn]
    }
    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:sub"
      values = [
        "repo:ruby-no-kai/takeout-app:environment:production",

      ]
    }
  }

}

resource "aws_iam_role_policy" "GhaTakeoutDeploy" {
  role   = aws_iam_role.GhaTakeoutDeploy.id
  name   = "GhaTakeoutDeploy"
  policy = data.aws_iam_policy_document.GhaTakeoutDeploy.json
}

data "aws_iam_policy_document" "GhaTakeoutDeploy" {
  statement {
    effect = "Allow"
    actions = [
      "application-autoscaling:DeregisterScalableTarget",
      "application-autoscaling:DescribeScheduledActions",
      "application-autoscaling:PutScalingPolicy",
      "application-autoscaling:PutScheduledAction",
      "application-autoscaling:RegisterScalableTarget",
    ]
    resources = ["*"]
  }
  statement {
    effect = "Allow"
    actions = [
      "autoscaling:DescribeAutoScalingGroups",
      "autoscaling:SetDesiredCapacity",
    ]
    resources = ["*"]
  }
  statement {
    effect = "Allow"
    actions = [
      "cloudwatch:DeleteAlarms",
      "cloudwatch:DescribeAlarms",
      "cloudwatch:PutMetricAlarm",
    ]
    resources = ["*"]
  }
  statement {
    effect = "Allow"
    actions = [
      "ec2:Describe*",
      "elasticloadbalancing:Describe*",
      "ecs:Describe*",
      "ecs:List*",
    ]
    resources = ["*"]
  }
  statement {
    effect = "Deny"
    actions = [
      "ecs:TagResource",
      "ecs:UntagResource",
    ]
    resources = ["*"]
    condition {
      test     = "StringNotEquals"
      variable = "aws:ResourceTag/Project"
      values   = ["takeout-app"]
    }
  }
  statement {
    effect = "Allow"
    actions = [
      "ecs:*",
    ]
    resources = ["*"]
    condition {
      test     = "StringEquals"
      variable = "aws:RequestTag/Project"
      values   = ["takeout-app"]
    }
  }
  statement {
    effect = "Allow"
    actions = [
      "ecs:*",
    ]
    resources = ["*"]
    condition {
      test     = "StringEquals"
      variable = "aws:ResourceTag/Project"
      values   = ["takeout-app"]
    }
  }
  statement {
    effect = "Allow"
    actions = [
      "ecs:UpdateService",
    ]
    resources = ["arn:aws:ecs:us-west-2:${local.aws_account_id}:service/*/takeout-*"]
  }
  statement {
    effect = "Allow"
    actions = [
      # "elasticloadbalancing:CreateListener",
      # "elasticloadbalancing:CreateLoadBalancer",
      # "elasticloadbalancing:CreateRule",
      # "elasticloadbalancing:CreateTargetGroup",
      # "elasticloadbalancing:DeleteLoadBalancer",
      # "elasticloadbalancing:DeleteRule",
      # "elasticloadbalancing:DeleteTargetGroup",
      "elasticloadbalancing:ModifyListener",
      "elasticloadbalancing:ModifyLoadBalancerAttributes",
      "elasticloadbalancing:ModifyRule",
      "elasticloadbalancing:ModifyTargetGroupAttributes",
      "elasticloadbalancing:SetSubnets",
    ]
    resources = ["*"]
    condition {
      test     = "StringEquals"
      variable = "aws:ResourceTag/Project"
      values   = ["takeout-app"]
    }
  }
  statement {
    effect = "Allow"
    actions = [
      # "elasticloadbalancing:CreateListener",
      # "elasticloadbalancing:CreateLoadBalancer",
      # "elasticloadbalancing:CreateRule",
      # "elasticloadbalancing:CreateTargetGroup",
      # "elasticloadbalancing:DeleteLoadBalancer",
      # "elasticloadbalancing:DeleteRule",
      # "elasticloadbalancing:DeleteTargetGroup",
      "elasticloadbalancing:ModifyListener",
      "elasticloadbalancing:ModifyLoadBalancerAttributes",
      "elasticloadbalancing:ModifyRule",
      "elasticloadbalancing:ModifyTargetGroupAttributes",
      "elasticloadbalancing:SetSubnets",
    ]
    resources = [
      "arn:aws:elasticloadbalancing:us-west-2:${local.aws_account_id}:loadbalancer/app/hako-takeout-app/*",
      "arn:aws:elasticloadbalancing:us-west-2:${local.aws_account_id}:listener/app/hako-takeout-app/*",
      "arn:aws:elasticloadbalancing:us-west-2:${local.aws_account_id}:listener-rule/app/hako-takeout-app/*",
      "arn:aws:elasticloadbalancing:us-west-2:${local.aws_account_id}:targetgroup/hako-takeout-app/*",
    ]
  }
  statement {
    effect = "Allow"
    actions = [
      "logs:CreateLogGroup",
      "logs:DescribeLogGroups",
    ]
    resources = ["*"]
  }
  statement {
    effect = "Allow"
    actions = [
      "iam:PassRole",
    ]
    resources = [
      aws_iam_role.TakeoutApp.arn,
      aws_iam_role.EcsExecTakeoutApp.arn,
    ]
  }
}
