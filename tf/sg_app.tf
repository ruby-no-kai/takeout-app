resource "aws_security_group" "app" {
  provider    = aws.usw2
  vpc_id      = data.aws_vpc.usw2.id
  name        = "takeout-app"
  description = "takeout-app tf/sg_app.tf"
}

resource "aws_security_group_rule" "app_egress" {
  provider          = aws.usw2
  security_group_id = aws_security_group.app.id
  type              = "egress"
  protocol          = -1
  from_port         = 0
  to_port           = 0
  cidr_blocks       = ["0.0.0.0/0"]
  ipv6_cidr_blocks  = ["::/0"]
}

resource "aws_security_group_rule" "app_ingress_bastion" {
  provider                 = aws.usw2
  security_group_id        = aws_security_group.app.id
  type                     = "ingress"
  protocol                 = "tcp"
  from_port                = 3000
  to_port                  = 3000
  source_security_group_id = data.aws_security_group.usw2_bastion.id
}

resource "aws_security_group_rule" "app_ingress_elb" {
  provider                 = aws.usw2
  security_group_id        = aws_security_group.app.id
  type                     = "ingress"
  protocol                 = "tcp"
  from_port                = 3000
  to_port                  = 3000
  source_security_group_id = aws_security_group.elb.id
}
