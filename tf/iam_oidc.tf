resource "aws_iam_openid_connect_provider" "takeout-app" {
  url = "https://takeout.rubykaigi.org"

  client_id_list = [
    "sts.amazonaws.com",
  ]

  thumbprint_list = [
    "9e99a48a9960b14926bb7f3b02e22da2b0ab7280",
  ]
}
