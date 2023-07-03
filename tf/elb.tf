# TODO: import ALB

#resource "aws_route53_record" "takeout-app-origin_rubykaigi_net" {
#  for_each = local.rubykaigi_net_zones
#  name     = "takeout-app-origin.rubykaigi.net."
#  zone_id  = each.value
#  type     = "CNAME"
#  ttl      = 60
#  records = [
#    "dualstack.hako-takeout-app-1068524270.us-west-2.elb.amazonaws.com.",
#  ]
#}
