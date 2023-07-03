data "aws_rds_engine_version" "postgresql14" {
  provider = aws.usw2
  engine   = "aurora-postgresql"
  version  = "14.5"
}

#module "takeout-db" {
#  source  = "terraform-aws-modules/rds-aurora/aws"
#  version = "8.3.1"
#  providers = {
#    aws = aws.usw2
#  }
#
#  name   = "takeout-db"
#  engine = data.aws_rds_engine_version.postgresql14.engine
#
#  engine_mode       = "provisioned"
#  engine_version    = data.aws_rds_engine_version.postgresql14.version
#  storage_encrypted = true
#
#  vpc_id                 = data.aws_vpc.usw2.id
#  create_db_subnet_group = true
#  subnets                = data.aws_subnets.usw2-private.ids
#  vpc_security_group_ids = [aws_security_group.db.id]
#  create_security_group  = false
#
#  monitoring_interval = 60
#
#  apply_immediately         = true
#  final_snapshot_identifier = "rubykaigi2023-takeout-app-final"
#  skip_final_snapshot       = false
#
#  serverlessv2_scaling_configuration = {
#    min_capacity = 1
#    max_capacity = 3
#  }
#
#  instance_class = "db.serverless"
#  instances = {
#    "001" = {}
#  }
#}

resource "aws_security_group" "db" {
  provider    = aws.usw2
  vpc_id      = data.aws_vpc.usw2.id
  name        = "takeout-db"
  description = "takeout-app tf/rds.tf"
}

resource "aws_security_group_rule" "db_egress" {
  provider          = aws.usw2
  security_group_id = aws_security_group.db.id
  type              = "egress"
  protocol          = -1
  from_port         = 0
  to_port           = 0
  cidr_blocks       = ["0.0.0.0/0"]
  ipv6_cidr_blocks  = ["::/0"]
}

resource "aws_security_group_rule" "db_ingress_bastion" {
  provider                 = aws.usw2
  security_group_id        = aws_security_group.db.id
  type                     = "ingress"
  protocol                 = -1
  from_port                = 5432
  to_port                  = 5432
  source_security_group_id = data.aws_security_group.usw2_bastion.id
}

resource "aws_security_group_rule" "db_ingress_app" {
  provider                 = aws.usw2
  security_group_id        = aws_security_group.db.id
  type                     = "ingress"
  protocol                 = -1
  from_port                = 5432
  to_port                  = 5432
  source_security_group_id = aws_security_group.app.id
}
