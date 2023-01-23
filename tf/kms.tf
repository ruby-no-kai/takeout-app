data "aws_kms_key" "usw2_ssm" {
  provider = aws.usw2
  key_id   = "alias/aws/ssm"
}
