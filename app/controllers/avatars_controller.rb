class AvatarsController < ApplicationController
  # development purpose
  def show
    chime_user = ChimeUser.eager_load(:attendee).find_by(handle: params[:handle])
    redirect_to AvatarProvider.url(chime_user.handle, chime_user.attendee.original_avatar_url, version: chime_user.version)
  end
end
