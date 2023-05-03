locals {
  aws_account_id = "005216166247"
}

provider "aws" {
  region              = "ap-northeast-1"
  allowed_account_ids = [local.aws_account_id]
  default_tags {
    tags = {
      Project   = "takeout-app"
      Component = "takeout-app"
    }
  }
}

provider "aws" {
  alias               = "use1"
  region              = "us-east-1"
  allowed_account_ids = [local.aws_account_id]
  default_tags {
    tags = {
      Project   = "takeout-app"
      Component = "takeout-app"
    }
  }
}

provider "aws" {
  alias               = "usw2"
  region              = "us-west-2"
  allowed_account_ids = [local.aws_account_id]
  default_tags {
    tags = {
      Project   = "takeout-app"
      Component = "takeout-app"
    }
  }
}
