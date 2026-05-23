terraform {
  backend "s3" {
    bucket         = "b2b-rag-terraform-state"
    key            = "free-tier/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "b2b-rag-terraform-locks"
  }
}