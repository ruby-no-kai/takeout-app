class TrackCard < ApplicationRecord
  belongs_to :control_colleration, required: false

  validates :track, presence: true
  validates :activation_at, presence: true

  validate :validate_track
  validate :validate_content

  before_validation :trigger_candidate_emit

  scope :active, -> (t = Time.zone.now) { where('activation_at <= ?', t).order(activation_at: :desc) }
  scope :candidate, -> (t = Time.zone.now) { where('activation_at > ?', t).order(activation_at: :desc) }

  def self.current_for(track, t: Time.zone.now)
    self.active(t).where(track: track).first
  end

  def self.candidate_for(track, t: Time.zone.now)
    self.candidate(t).where(track: track).last
  end

  def self.set(track, content, t: Time.zone.now, emit: true)
    self.create!(
      track: track,
      content: content,
      activation_at: t,
    )
    EmitConferenceDataJob.perform_now(route: :ivs) if emit
  end

  def as_json(control: false)
    content.merge(
      at: self.activation_at.to_i,
      track: track,
      ut: self.updated_at.to_i,
    ).merge(control ? {
      id: id,
      control_colleration: control_colleration&.as_json,
    } : {})
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
    return if track == '_screen'
    errors.add :track, 'should be defined' unless Conference.data.fetch(:tracks).has_key?(track)
  end

  private def validate_content
    unless content.kind_of?(Hash)
      errors.add :content, 'should be an object (Hash)'
      return
    end

    validate_topic if content['topic']
    validate_speakers if content['speakers']

    validate_screen if content['screen']
    validate_upcoming_topics if content['upcoming_topics']
  end

  private def validate_topic
    unless content['topic'].kind_of?(Hash)
      errors.add :content, '.topic should be a object (Hash)'
      return
    end
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
      return
    end
    content['speakers'].each do |s|
      unless s.kind_of?(Hash)
        errors.add :content, '.speakers should be a Speaker[]'
        next
      end

      errors.add :content, '.speakers[].name should be present' unless s['name'].kind_of?(String)
    end
  end

  private def validate_screen
    if content['screen']['heading'] && !content['screen']['heading'].is_a?(String)
      errors.add :content, '.screen.heading should be a string or null'
    end
    if content['screen']['next_schedule'] 
      unless content['screen']['next_schedule'].is_a?(Hash)
        errors.add :content, '.screen.next_schedule should be a ScreenNextSchedule or null'
        return
      end
      unless content['screen']['next_schedule']['at'].is_a?(Integer)
        errors.add :content, '.screen.next_schedule.at should be a number'
      end
      unless content['screen']['next_schedule']['title'].is_a?(String)
        errors.add :content, '.screen.next_schedule.title should be a string'
      end
    end
    if content['screen']['footer'] && !content['screen']['footer'].is_a?(String)
      errors.add :content, '.screen.footer should be a string or null'
    end
  end

  private def validate_upcoming_topics
    unless content['upcoming_topics'].kind_of?(Array)
      errors.add :content, '.upcoming_topics should be a UpcomingTopic[]'
      return
    end
    content['upcoming_topics'].each do |ut|
      unless ut.kind_of?(Hash)
        errors.add :content, '.upcoming_topics[] should be a UpcomingTopic object'
        next
      end
      errors.add :content, '.upcoming_topics[].at should be a number' unless ut['at'].is_a?(Integer)

      unless ut['speakers'].kind_of?(Array)
        errors.add :content, '.upcoming_topics[].speakers should be a Speaker[]'
        next
      end
      ut['speakers'].each do |s|
        unless s.kind_of?(Hash)
          errors.add :content, '.upcoming_topics[].speakers should be a Speaker[]'
          next
        end
        errors.add :content, '.upcoming_topics[].speakers[].name should be present' unless s['name'].kind_of?(String)
      end
      unless ut['topic'].kind_of?(Hash)
        errors.add :content, '.upcoming_topics[].topic should be a Topic'
        next
      end
      unless ut['topic']['labels'].kind_of?(Array)
        errors.add :content, '.upcoming_topics[].topic.labels should be a string[]'
        next
      end
      unless ut['topic']['labels'].all? { |_| _.kind_of?(String) }
        errors.add :content, '.upcoming_topics[].topic.labels should be a string[]'
        next
      end
    end
  end

  def self.create_dummy!(track, at: Time.zone.now)
    words = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.".split(/ +/).shuffle
    create!(
      track: track,
      activation_at: at,
      content: {
        interpretation: true,
        topic: {
          title: words.sample(5).join(' '),
          author: "Author (#{track})",
          description: words.join(' '),
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
