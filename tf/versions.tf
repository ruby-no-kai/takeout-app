terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.55"
    }
    external = {
      source  = "hashicorp/external"
      version = "~> 2.2"
    }
  }
}

provider "external" {}
