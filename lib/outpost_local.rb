module OutpostLocal
  def self.call(env)
    return [404, {}, []] if env['REQUEST_METHOD'] != 'GET'
    key = (env['REQUEST_PATH'] || '')[1..-1] # after /

    s3 = Aws::S3::Client.new(region: Rails.application.config.x.s3.public_region, logger: Rails.logger)
    resp = s3.get_object(bucket: Rails.application.config.x.s3.public_bucket, key: "#{Rails.application.config.x.s3.public_prefix}#{key}")

    [200, {'Content-Type' => resp.content_type || 'application/octet-stream', 'Cache-Control' => resp.cache_control || 'max-age=0'}, resp.body]
  rescue Aws::S3::Errors::NoSuchKey
    [404, {}, []]
  rescue Aws::S3::Errors::AccessDenied
    [403, {}, []]
  end
end
