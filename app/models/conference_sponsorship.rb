class ConferenceSponsorship < ApplicationRecord
  def handle
    "ps_#{sponsor_app_id}"
  end

  def as_chat_message 
    promo.present? ? {
      channel: "PROMO",
      id: "PROMO-#{id}",
      content: promo,
      sender: {handle: handle, version: "0", name: name},
      timestamp: (Time.now.to_f*1000).to_i,
      redacted: false,
      adminControl: {promo: true},
   } : nil
  end
end
