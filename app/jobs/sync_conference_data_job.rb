require 'yaml'
require 'open-uri'

class SyncConferenceDataJob < ApplicationJob
  def perform
    ApplicationRecord.transaction do
      sync_speakers
      sync_presentations

      validate_data
    end

    upload_speaker_avatars
  end

  def sync_speakers
    data = YAML.safe_load(URI.open('https://rubykaigi.org/2021-takeout/data/speakers.yml', 'r', &:read))

    known_slugs = []
    data.fetch('keynotes', {}).merge(data.fetch('speakers', {})).each do |slug, info|
      known_slugs << slug
      s = ConferenceSpeaker.find_or_initialize_by(slug: slug)
      s.update!(
        name: info.fetch('name'),
        bio: info.fetch('bio', ''),
        github_id: info.fetch('github_id', nil),
        twitter_id: info.fetch('twitter_id', nil),
        gravatar_hash: info.fetch('gravatar_hash', nil),
      )
    end

    ConferenceSpeaker.where.not(slug: known_slugs).each(&:destroy!)
  end

  def sync_presentations
    data = YAML.safe_load(URI.open('https://rubykaigi.org/2021-takeout/data/presentations.yml', 'r', &:read))

    data.each do |slug, info|
      s = ConferencePresentation.find_or_initialize_by(slug: slug)
      s.update!(
        title: info.fetch('title'),
        kind: info.fetch('type', 'presentation'),
        language: info.fetch('language', '?'),
        description: info.fetch('description', ''),
        speaker_slugs: info.fetch('speakers', []).map { |_| _.fetch('id') }.compact,
      )
    end

    ConferencePresentation.where.not(slug: data.keys).each(&:destroy!)
  end

  def validate_data
    ConferencePresentation.all.each do |pr|
      if pr.speakers.map(&:slug).sort != pr.speaker_slugs.sort
        raise "presentation=#{pr.slug} (#{pr.speaker_slugs}) is missing speaker relationship"
      end
    end
  end

  def upload_speaker_avatars
    s3 = Aws::S3::Client.new(region: Rails.application.config.x.s3.public_region, logger: Rails.logger)
    ConferenceSpeaker.find_in_batches do |batch|
      batch.each do |speaker|
        URI.open(speaker.original_avatar_url, 'r') do |io|
          s3.put_object(
            bucket: Rails.application.config.x.s3.public_bucket,
            key: "#{Rails.application.config.x.s3.public_prefix}avatars/s_#{speaker.slug}",
            content_type: io.content_type,
            cache_control: 'pubilc, max-age=86400, stale-while-revalidate=3600',
            body: io,
          )
        end
      end
    end
  end
end
