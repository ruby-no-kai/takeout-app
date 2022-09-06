namespace :takeout do
  task :import_sponsorships => :environment do

    s3 = Aws::S3::Client.new(region: Rails.application.config.x.s3.public_region, logger: Rails.logger)
    resp = s3.get_object(
      bucket: Rails.application.config.x.s3.public_bucket,
      key: "#{Rails.application.config.x.s3.public_prefix}tmp/sponsors.json",
    )

    JSON.parse(resp.body.read).fetch('conference_sponsorships').each do |row| 
      s = ConferenceSponsorship.find_or_initialize_by(sponsor_app_id: row.fetch('sponsor_app_id'))
      s.update!(row)
    end
  end
end
