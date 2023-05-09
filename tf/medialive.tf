data "aws_iam_role" "MediaLiveAccessRole" {
  name = "MediaLiveAccessRole"
}

data "external" "medialive-channel-cfn" {
  program = ["jsonnet", "${path.module}/medialive-cfn/external.jsonnet"]
}

data "external" "medialive-secrets" {
  program = ["jsonnet", "${path.module}/medialive-cfn/secrets.jsonnet"]
}

resource "aws_security_group" "medialive" {
  vpc_id      = data.aws_vpc.main.id
  name        = "takeout-medialive"
  description = "takeout-medialive"
}

resource "aws_security_group_rule" "medialive_egress" {
  security_group_id = aws_security_group.medialive.id
  type              = "egress"
  protocol          = -1
  from_port         = 0
  to_port           = 0
  cidr_blocks       = ["0.0.0.0/0"]
  ipv6_cidr_blocks  = ["::/0"]

}
resource "aws_security_group_rule" "medialive_ingress" {
  security_group_id = aws_security_group.medialive.id
  type              = "ingress"
  protocol          = "tcp"
  from_port         = 1
  to_port           = 65535
  cidr_blocks = [
    "10.33.128.0/17",
    "10.33.0.0/24",
    "10.33.1.0/24",
    "10.33.21.0/24",
    "10.33.100.0/24",
  ]
}

locals {
  medialive_captioner_ip = aws_instance.captioner.private_ip
  medialive_channel_parameters_common = {
    StreamKey           = data.external.medialive-secrets.result.stream_key
    Subnet1Id           = data.aws_subnet.main-public-c.id
    Subnet2Id           = data.aws_subnet.main-public-d.id
    RoleArn             = data.aws_iam_role.MediaLiveAccessRole.arn
    VpcSgDefaultId      = data.aws_security_group.default.id
    VpcSgId             = aws_security_group.medialive.id
    MedialiveSgPublicId = "74213"
  }
}


resource "aws_cloudformation_stack" "dev" {
  name          = "rk23-medialive-dev"
  template_body = data.external.medialive-channel-cfn.result.template

  parameters = merge(local.medialive_channel_parameters_common, {
    ChannelName  = "rk23-dev"
    CaptionerUrl = "udp://${local.medialive_captioner_ip}:10000"
    IvsUrl       = local.ivs_channel_urls["dev"].url
    IvsKey       = local.ivs_channel_urls["dev"].key
    StreamKey    = "dedicatedtomoonlight"
  })
}
resource "aws_cloudformation_stack" "prd-a-main" {
  name          = "rk22-medialive-prd-a-main"
  template_body = data.external.medialive-channel-cfn.result.template

  parameters = merge(local.medialive_channel_parameters_common, {
    ChannelName  = "rk22-prd-a-main"
    CaptionerUrl = "udp://${local.medialive_captioner_ip}:10001"
    IvsUrl       = local.ivs_channel_urls["prd_a_main"].url
    IvsKey       = local.ivs_channel_urls["prd_a_main"].key
  })
}
resource "aws_cloudformation_stack" "prd-b-main" {
  name          = "rk22-medialive-prd-b-main"
  template_body = data.external.medialive-channel-cfn.result.template

  parameters = merge(local.medialive_channel_parameters_common, {
    ChannelName  = "rk22-prd-b-main"
    CaptionerUrl = "udp://${local.medialive_captioner_ip}:10002"
    IvsUrl       = local.ivs_channel_urls["prd_b_main"].url
    IvsKey       = local.ivs_channel_urls["prd_b_main"].key
  })
}
resource "aws_cloudformation_stack" "prd-c-main" {
  name          = "rk22-medialive-prd-c-main"
  template_body = data.external.medialive-channel-cfn.result.template

  parameters = merge(local.medialive_channel_parameters_common, {
    ChannelName  = "rk22-prd-c-main"
    CaptionerUrl = "udp://${local.medialive_captioner_ip}:10003"
    IvsUrl       = local.ivs_channel_urls["prd_c_main"].url
    IvsKey       = local.ivs_channel_urls["prd_c_main"].key
  })
}

resource "aws_cloudformation_stack" "prd-a-interpret" {
  name          = "rk22-medialive-prd-a-interpret"
  template_body = data.external.medialive-channel-cfn.result.template

  parameters = merge(local.medialive_channel_parameters_common, {
    ChannelName  = "rk22-prd-a-interpret"
    CaptionerUrl = "udp://${local.medialive_captioner_ip}:10011"
    IvsUrl       = local.ivs_channel_urls["prd_a_interpret"].url
    IvsKey       = local.ivs_channel_urls["prd_a_interpret"].key
  })
}
#resource "aws_cloudformation_stack" "prd-b-interpret" {
#  name          = "rk22-medialive-prd-b-interpret"
#  template_body = data.external.medialive-channel-cfn.result.template
#
#  parameters = merge(local.medialive_channel_parameters_common, {
#    ChannelName  = "rk22-prd-b-interpret"
#    CaptionerUrl = "udp://${local.medialive_captioner_ip}:10012"
#    IvsUrl       = local.ivs_channel_urls["prd_b_interpret"].url
#    IvsKey       = local.ivs_channel_urls["prd_b_interpret"].key
#  })
#}
resource "aws_cloudformation_stack" "prd-c-interpret" {
  name          = "rk22-medialive-prd-c-interpret"
  template_body = data.external.medialive-channel-cfn.result.template

  parameters = merge(local.medialive_channel_parameters_common, {
    ChannelName  = "rk22-prd-c-interpret"
    CaptionerUrl = "udp://${local.medialive_captioner_ip}:10013"
    IvsUrl       = local.ivs_channel_urls["prd_c_interpret"].url
    IvsKey       = local.ivs_channel_urls["prd_c_interpret"].key
  })
}
