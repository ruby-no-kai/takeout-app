class FrontendController < ApplicationController
  before_action :require_attendee, only: %i(show_require_attendee)

  def show
  end

  def show_require_attendee
  end
end
