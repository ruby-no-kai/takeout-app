require 's3_assets_uploader/rake_task'
namespace :assets do
  S3AssetsUploader::RakeTask.new(:upload => :environment) do |config|
    config.s3_client = Aws::S3::Client.new(region: Rails.application.config.x.s3.public_region)
    config.bucket = Rails.application.config.x.s3.public_bucket

    config.cache_control = 'max-age=31536000'
    config.assets_prefix = Rails.application.config.x.s3.public_prefix[0...-1] # remove trailing slash
    config.additional_paths = ['public/packs']
  end
end
