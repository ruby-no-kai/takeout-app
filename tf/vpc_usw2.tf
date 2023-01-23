data "aws_vpc" "usw2" {
  provider = aws.usw2
  id       = "vpc-0a4e5da322884146d"
}

data "aws_subnets" "usw2-private" {
  provider = aws.usw2
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.usw2.id]
  }
  filter {
    name   = "tag:Tier"
    values = ["public"]
  }
}

data "aws_security_group" "usw2_bastion" {
  provider = aws.usw2
  vpc_id   = data.aws_vpc.usw2.id
  name     = "bastion"
}
