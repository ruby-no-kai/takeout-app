class Api::Control::ApplicationController < Api::ApplicationController
  before_action :require_control
end
