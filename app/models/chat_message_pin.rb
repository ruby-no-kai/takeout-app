class ChatMessagePin < ApplicationRecord
  # TODO: validate

  def self.set(track, content, save: true, emit: true)
    pin = ChatMessagePin.find_or_initialize_by(track: track)
    pin.assign_attributes(content: content)
    if save
      pin.save!
      if emit
        EmitChatMessagePinJob.perform_now(pin: pin)
      end
    end

    pin
  end

  def as_json
    {
      at: updated_at.to_i,
      track: track,
      message: content,
    }
  end
end
