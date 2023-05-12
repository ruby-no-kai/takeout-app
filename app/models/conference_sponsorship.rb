class ConferenceSponsorship < ApplicationRecord
  def handle
    "ps_#{sponsor_app_id}"
  end

  def as_json
    {
      id: id,
      sponsor_app_id: sponsor_app_id,
      avatar_url: "/avatars/p_#{sponsor_app_id}",
      name: name,
      large_display: large_display, # TODO: remove
      plan: plan.presence || (large_display ? 'ruby' : 'platinum'),
      promo: promo,
    }
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
