class AvatarsController < ApplicationController
  # development purpose; override /avatars/ prefix with S3 using CDN in production
  def show
    handle = params[:handle]
    case 
    when handle.start_with?('u_')
      chime_user = ChimeUser.eager_load(:attendee).find_by(handle: handle)
      url = AvatarProvider.url(chime_user&.handle, chime_user&.attendee&.original_avatar_url, version: chime_user&.version)
        return redirect_to(url, allow_other_host: true) if url

    when handle.start_with?('s_')
      speaker = ConferenceSpeaker.find_by(slug: handle[2..-1])
      if speaker
        return redirect_to(speaker.original_avatar_url, allow_other_host: true)
      end

    when handle.match(/^ps?_(.+)$/) # ps_ = small sponsor logo, p_ = large sponsor logo
      sponsor = ConferenceSponsorship.find_by(sponsor_app_id: $1)
      if sponsor
        return redirect_to(sponsor.avatar_url, allow_other_host: true)
      end

    end

    render(status: 404, json: {ok: false, error: 'not found'}.to_json)
  end
end
