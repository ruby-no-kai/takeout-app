class ControlColleration < ApplicationRecord
  has_many :chat_spotlights
  has_many :track_cards

  def as_json
    {
      id: id,
      description: description,
    }
  end
end
