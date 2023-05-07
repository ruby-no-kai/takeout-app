resource "aws_security_group" "captioner" {
  name        = "takeout-captioner"
  description = "takeout-app/caption"
}

resource "aws_security_group_rule" "captioner_udpmedialive" {
  security_group_id = aws_security_group.captioner.id
  type              = "ingress"
  from_port         = 10000
  to_port           = 30000
  protocol          = "udp"
  #cidr_blocks       = toset([for x in data.aws_vpc.main.cidr_block_associations : x.cidr_block])
  source_security_group_id = aws_security_group.medialive.id
}


data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-arm64-server-*"]
  }
}

resource "aws_instance" "captioner" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = "t4g.micro"
  subnet_id     = data.aws_subnet.main-public-c.id

  vpc_security_group_ids = [data.aws_security_group.default.id, aws_security_group.captioner.id]
  iam_instance_profile   = aws_iam_instance_profile.TakeoutCaptioner.name

  user_data = file("./captioner-cloudinit.yml")

  tags = {
    Name      = "takeout-captioner"
    Component = "captioner"
  }
  lifecycle {
    ignore_changes = [ami]
  }
}

resource "aws_route53_record" "captioner_apne1_rubykaigi_net" {
  name    = "captioner.apne1.rubykaigi.net."
  zone_id = data.aws_route53_zone.rubykaigi-net_private.id
  type    = "A"
  ttl     = 60
  records = [
    aws_instance.captioner.private_ip,
  ]
}
