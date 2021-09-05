class FrontendController < ApplicationController
  before_action :require_attendee, only: %i(show_require_attendee index)
  before_action :require_control, only: %i(show_require_control)

  def index
    redirect_to "/tracks/#{Conference.data.fetch(:default_track)}"
  end

  def show
  end

  def show_require_attendee
  end

  def show_require_control
  end
end
