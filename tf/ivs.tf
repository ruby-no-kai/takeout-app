locals {
  ivs_playback_key_arns = {
    dev = "arn:aws:ivs:us-west-2:005216166247:playback-key/pvfNmjTDJ9MU"
    prd = "arn:aws:ivs:us-west-2:005216166247:playback-key/AAzqWp00QN9A"
  }

  ivs_channel_names = toset([
    "dev",
    "prd_a_main",
    "prd_b_main",
    #"prd_c_main",
    "prd_a_interpret",
    "prd_b_interpret",
  ])
}

resource "aws_ivs_recording_configuration" "rk-ivs-archive" {
  provider = aws.usw2
  name     = "rk-ivs-archive"
  destination_configuration {
    s3 {
      bucket_name = "rk-ivs-archive"
    }
  }
  thumbnail_configuration {
    recording_mode          = "INTERVAL"
    target_interval_seconds = 60
  }

  tags = {
    Name      = "rk-ivs-archive"
    Component = "ivs"
  }
}

resource "aws_ivs_channel" "channel" {
  provider = aws.usw2
  for_each = local.ivs_channel_names

  name = "takeout-${each.key}"

  authorized   = true
  latency_mode = "LOW"
  type         = "STANDARD"

  recording_configuration_arn = aws_ivs_recording_configuration.rk-ivs-archive.arn

  tags = {
    Name      = "takeout-${each.key}"
    Component = "ivs"
  }
}

data "aws_ivs_stream_key" "channel" {
  provider = aws.usw2
  for_each = local.ivs_channel_names

  channel_arn = aws_ivs_channel.channel[each.key].arn
}

locals {
  ivs_channel_urls = {
    for k in local.ivs_channel_names : k => {
      url = "rtmps://${aws_ivs_channel.channel[k].ingest_endpoint}:443/app/"
      key = data.aws_ivs_stream_key.channel[k].value
    }
  }
}
