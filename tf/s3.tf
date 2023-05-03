resource "aws_s3_bucket" "rk-takeout-app" {
  provider = aws.usw2
  bucket   = "rk-takeout-app-usw2"
}

data "aws_iam_policy_document" "s3-rk-takeout-app" {
  statement {
    effect    = "Allow"
    actions   = ["*"]
    resources = ["${aws_s3_bucket.rk-takeout-app.arn}/*", aws_s3_bucket.rk-takeout-app.arn]
    principals {
      type = "AWS"
      identifiers = [
        "arn:aws:iam::${local.aws_account_id}:root",
      ]
    }
  }
  statement {
    effect  = "Allow"
    actions = ["s3:GetObject"]
    resources = [
      "${aws_s3_bucket.rk-takeout-app.arn}/dev/avatars/*",
      "${aws_s3_bucket.rk-takeout-app.arn}/prd/avatars/*",
      "${aws_s3_bucket.rk-takeout-app.arn}/dev/packs/*",
      "${aws_s3_bucket.rk-takeout-app.arn}/prd/packs/*",
      "${aws_s3_bucket.rk-takeout-app.arn}/dev/assets/*",
      "${aws_s3_bucket.rk-takeout-app.arn}/prd/assets/*",
      "${aws_s3_bucket.rk-takeout-app.arn}/dev/outpost/*",
      "${aws_s3_bucket.rk-takeout-app.arn}/prd/outpost/*",
      "${aws_s3_bucket.rk-takeout-app.arn}/tmp/*",
    ]
    principals {
      type = "AWS"
      identifiers = [
        "*",
      ]
    }
  }
}

resource "aws_s3_bucket_policy" "rk-takeout-app" {
  provider = aws.usw2
  bucket   = aws_s3_bucket.rk-takeout-app.id
  policy   = data.aws_iam_policy_document.s3-rk-takeout-app.json
}

##########

resource "aws_s3_bucket" "rk-takeout-app-apne1" {
  bucket = "rk-takeout-app"
}

data "aws_iam_policy_document" "s3-rk-takeout-app-apne1" {
  statement {
    effect    = "Allow"
    actions   = ["*"]
    resources = ["${aws_s3_bucket.rk-takeout-app-apne1.arn}/*", aws_s3_bucket.rk-takeout-app-apne1.arn]
    principals {
      type = "AWS"
      identifiers = [
        "arn:aws:iam::${local.aws_account_id}:root",
      ]
    }
  }
  statement {
    effect  = "Allow"
    actions = ["s3:GetObject"]
    resources = [
      "${aws_s3_bucket.rk-takeout-app-apne1.arn}/dev/avatars/*",
      "${aws_s3_bucket.rk-takeout-app-apne1.arn}/prd/avatars/*",
      "${aws_s3_bucket.rk-takeout-app-apne1.arn}/dev/packs/*",
      "${aws_s3_bucket.rk-takeout-app-apne1.arn}/prd/packs/*",
      "${aws_s3_bucket.rk-takeout-app-apne1.arn}/dev/assets/*",
      "${aws_s3_bucket.rk-takeout-app-apne1.arn}/prd/assets/*",
      "${aws_s3_bucket.rk-takeout-app-apne1.arn}/dev/outpost/*",
      "${aws_s3_bucket.rk-takeout-app-apne1.arn}/prd/outpost/*",
      "${aws_s3_bucket.rk-takeout-app-apne1.arn}/tmp/*",
    ]
    principals {
      type = "AWS"
      identifiers = [
        "*",
      ]
    }
  }
}

resource "aws_s3_bucket_policy" "rk-takeout-app-apne1" {
  bucket = aws_s3_bucket.rk-takeout-app-apne1.id
  policy = data.aws_iam_policy_document.s3-rk-takeout-app-apne1.json
}
