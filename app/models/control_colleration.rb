class ControlColleration < ApplicationRecord
  has_many :chat_spotlights, dependent: :destroy
  has_many :track_cards, dependent: :destroy

  def as_json
    {
      id: id,
      description: description,
    }
  end
end
