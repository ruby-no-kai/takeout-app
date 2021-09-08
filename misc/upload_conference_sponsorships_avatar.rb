require 'json'
require 'open-uri'
require 'aws-sdk-s3'

# Read JSON generated with generate_conference_sponsorships_data.rb
# Needs Imagemagick

bucket, prefix = ARGV[0,2]
unless bucket && prefix
  abort "usage: #$0 bucket prefix\nexample: #$0 rk-takeout-app prd/avatars/"
end

s3 = Aws::S3::Client.new()

sponsors = JSON.parse($stdin.read).fetch('conference_sponsorships')


sponsors.each do |sponsor|
  orig = URI.open(sponsor.fetch('avatar_url'), 'r', &:read)

  small = IO.popen(['convert', '-', '-geometry', '150x150', '-format', 'jpg', '-'], 'w+') do |io|
    io.write orig
    io.close_write
    io.read
  end
  raise unless $?.success?


  s3.put_object(
    bucket: bucket,
    key: "#{prefix}p_#{sponsor.fetch('sponsor_app_id')}",
    content_type: 'image/png',
    cache_control: 'public, max-age=86400, stale-while-revalidate=3600',
    body: orig
  )
  s3.put_object(
    bucket: bucket,
    key: "#{prefix}ps_#{sponsor.fetch('sponsor_app_id')}",
    content_type: 'image/jpeg',
    cache_control: 'public, max-age=86400, stale-while-revalidate=3600',
    body: small,
  )
end
