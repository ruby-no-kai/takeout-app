class TrackCard < ApplicationRecord
  validates :track, presence: true
  validates :activation_at, presence: true

  validate :validate_track
  validate :validate_content

  before_validation :trigger_candidate_emit

  scope :active, -> (t = Time.zone.now) { where('activation_at <= ?', t).order(activation_at: :desc) }
  scope :candidate, -> (t = Time.zone.now) { where('activation_at > ?', t).order(activation_at: :desc) }

  def self.current_for(track)
    self.active.where(track: track).first
  end

  def self.candidate_for(track)
    self.candidate.where(track: track).last
  end

  def as_json
    content.merge(
      at: self.activation_at.to_i,
      track: track,
    )
  end

  def candidate?(t = Time.zone.now)
    activation_at && activation_at > t
  end

  def trigger_candidate_emit
    self.pending_candidate_emit = true if (!persisted? || changed?) && candidate? && pending_candidate_emit_was != true
  end

  def need_emit_as_candidate?(t = Time.zone.now)
    candidate?(t) && (pending_candidate_emit || (activation_at - t) <= 60)
  end

  private def validate_track
    errors.add :track, 'should be defined' unless Conference.data.fetch(:tracks).has_key?(track)
  end

  private def validate_content
    unless content.kind_of?(Hash)
      errors.add :content, 'should be an object (Hash)'
      return
    end

    validate_topic if content['topic']
    validate_speakers if content['speakers']
  end

  private def validate_topic
    unless content['topic']['labels'].kind_of?(Array)
      errors.add :content, '.topic.labels should be a string[]'
    end
    unless content['topic']['labels'].all? { |_| _.kind_of?(String) }
      errors.add :content, '.topic.labels should be a string[]'
    end
  end

  private def validate_speakers
    unless content['speakers'].kind_of?(Array)
      errors.add :content, '.speakers should be a Speaker[]'
    end
    content['speakers'].each do |s|
      unless s.kind_of?(Hash)
        errors.add :content, '.speakers should be a Speaker[]'
        next
      end

      errors.add :content, '.speakers[].name should be present' unless s['name'].kind_of?(String)
    end
  end

  def self.create_dummy!(track, at: Time.zone.now)
    create!(
      track: track,
      activation_at: at,
      content: {
        interpretation: true,
        topic: {
          title: "Topic (#{track})",
          author: "Author (#{track})",
          description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.".split(/ +/).shuffle.join(' '),
          labels: %w(ja en foobar),
        },
        speakers: [
          id: 'sorah',
          name: 'Sorah Fukumori',
          github_id: 'sorah',
          twitter_id: 'sorah',
          avatar_url: 'https://img.sorah.jp/x/icon2021.rect-h.480.png',
        ],
      },
    )
  end
end
