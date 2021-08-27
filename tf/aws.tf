provider "aws" {
  alias               = "apne1"
  region              = "ap-northeast-1"
  allowed_account_ids = ["005216166247"]
  default_tags = {
    Project = "takeout-app"
  }
}


provider "aws" {
  alias               = "usw2"
  region              = "us-west-2"
  allowed_account_ids = ["005216166247"]
  default_tags = {
    Project = "takeout-app"
  }
}
