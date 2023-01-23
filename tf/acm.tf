data "aws_acm_certificate" "use1-wild-rk-o" {
  provider    = aws.use1
  domain      = "rubykaigi.org"
  most_recent = true
}

data "aws_acm_certificate" "usw2-wild-rk-o" {
  provider    = aws.usw2
  domain      = "*.rubykaigi.org"
  most_recent = true
}
