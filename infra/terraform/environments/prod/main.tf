provider "aws" {
  region = "us-east-1"
}

module "networking" {
  source = "../../modules/networking"

  region   = "us-east-1"
  vpc_cidr = "10.0.0.0/16"
}