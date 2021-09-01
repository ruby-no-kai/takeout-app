class FrontendController < ApplicationController
  before_action :require_attendee, only: %i(show_require_attendee)
  before_action :require_control, only: %i(show_require_control)

  def show
  end

  def show_require_attendee
  end

  def show_require_control
  end
end
