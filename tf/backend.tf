terraform {
  backend "s3" {
    bucket               = "rk-infra"
    workspace_key_prefix = "terraform"
    key                  = "terraform/takeout-app.tfstate"
    region               = "ap-northeast-1"
    # dynamodb_table       = "rk-terraform-locks"
  }
}
