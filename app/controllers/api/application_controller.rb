class Api::ApplicationController < ::ApplicationController
  def require_attendee
    if !current_attendee || current_attendee.voided?
      raise Error::Unauthorized
    end
  end

  def require_control
    unless session[:staff_control]
      raise Error::Unauthorized
    end
  end


  module Error
    class NotFound < StandardError; end
    class BadRequest < StandardError; end
    class Forbidden < StandardError; end
    class Unauthorized < StandardError; end
  end

  rescue_from Error::NotFound do |err|
    render(status: 404, json: {error: 404, message: err.message}.to_json)
  end

  rescue_from Error::BadRequest do |err|
    render(status: 400, json: {error: 400, message: err.message}.to_json)
  end

  rescue_from Error::Unauthorized do |err|
    render(status: 401, json: {error: 401, message: err.message}.to_json)
  end

  rescue_from Error::Forbidden do |err|
    render(status: 403, json: {error: 403, message: err.message}.to_json)
  end

  rescue_from ActiveRecord::RecordInvalid do |err|
    render(status: 422, json: {
      error: 422,
      name: "ActiveRecord::RecordInvalid",
      human_message: "Failed to save record",
      human_descriptions: err.record.errors.full_messages,
    }.to_json)
  end
end
