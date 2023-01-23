resource "aws_security_group" "elb" {
  provider    = aws.usw2
  vpc_id      = data.aws_vpc.usw2.id
  name        = "takeout-elb"
  description = "takeout-elb tf/sg_elb.tf"
}

resource "aws_security_group_rule" "elb_egress" {
  provider          = aws.usw2
  security_group_id = aws_security_group.elb.id
  type              = "egress"
  protocol          = -1
  from_port         = 0
  to_port           = 0
  cidr_blocks       = ["0.0.0.0/0"]
  ipv6_cidr_blocks  = ["::/0"]
}

resource "aws_security_group_rule" "elb_ingress_icmp" {
  provider          = aws.usw2
  security_group_id = aws_security_group.elb.id
  type              = "ingress"
  protocol          = "icmp"
  from_port         = -1
  to_port           = -1
  cidr_blocks       = ["0.0.0.0/0"]
  ipv6_cidr_blocks  = ["::/0"]
}

resource "aws_security_group_rule" "elb_ingress_http" {
  provider          = aws.usw2
  security_group_id = aws_security_group.elb.id
  type              = "ingress"
  protocol          = "tcp"
  from_port         = 80
  to_port           = 80
  cidr_blocks       = ["0.0.0.0/0"]
  ipv6_cidr_blocks  = ["::/0"]
}

resource "aws_security_group_rule" "elb_ingress_https" {
  provider          = aws.usw2
  security_group_id = aws_security_group.elb.id
  type              = "ingress"
  protocol          = "tcp"
  from_port         = 443
  to_port           = 443
  cidr_blocks       = ["0.0.0.0/0"]
  ipv6_cidr_blocks  = ["::/0"]
}

