class PurgeCloudfrontCacheJob < ApplicationJob
  def perform(paths)
    distribution_id = Rails.configuration.x.cdn.cloudfront_distribution_id
    return unless distribution_id

    @cloudfront = Aws::CloudFront::Client.new(region: 'us-east-1', logger: Rails.logger)
    @cloudfront.create_invalidation(
      distribution_id: distribution_id,
      invalidation_batch: {
        paths: {
          quantity: paths.size,
          items: paths
        },
        caller_reference: "#{self.class.name}-#{Rails.env}-#{job_id}"
      },
    )
  end
end
