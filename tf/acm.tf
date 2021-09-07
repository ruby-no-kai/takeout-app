data "aws_acm_certificate" "use1-wild-rk-o" {
  provider    = aws.use1
  domain      = "rubykaigi.org"
  most_recent = true
}


