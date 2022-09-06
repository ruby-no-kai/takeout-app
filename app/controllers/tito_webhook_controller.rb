class TitoWebhookController < ApplicationController
  before_action :verify_payload
  skip_before_action :verify_authenticity_token

  def create
    event_name = request.headers['x-webhook-name']
    return render(status: 400, json: {status: :unknown_type}) unless event_name&.start_with?('ticket.')

    updated_at = params[:updated_at]&.yield_self { |_| Time.parse(_) }
    return render(status: 400, json: {status: :missing_updated_at}) unless updated_at

    ticket = Ticket.find_or_initialize_by(tito_id: params[:id]&.to_i)
    return render(status: 200, json: {status: :skipped}) if ticket.updated_at && ticket.updated_at >= updated_at

    ticket.assign_attributes(
      slug: params[:slug],
      reference: params[:reference],
      state: params[:state_name] || params[:state], # ?
      email: params[:email],
      first_name: params[:first_name],
      last_name: params[:last_name],
      assigned: params[:assigned],
      registration_slug: params[:registration_slug],
      release_slug: params[:release_slug],
      release_title: params[:release_title],
      discount_code_used: params[:discount_code_used],
      admin_url: params[:admin_url],
      metadata: params[:metadata]&.fetch(:takeout_app, {}) || {},
      tito_updated_at: updated_at,
    )

    ApplicationRecord.transaction do
      if ticket.save
        if %w(ticket.reassigned ticket.voided).include?(event_name) || ticket.state == 'void'
          ticket.attendees.each(&:void!) # TODO: void Chime membership (void job)
        end

        render(status: 200, json: {status: :ok})
      else
        render(status: 400, json: {status: :invalid_record}) # TODO: Raven
      end
    end
  end

  private

  def verify_payload
    request.body.rewind
    body = request.body.read

    secret = Rails.application.config.x.tito.webhook_secret
    return unless secret

    given_signature = request.headers['tito-signature'] || ''
    signature = [OpenSSL::HMAC.digest(OpenSSL::Digest.new('sha256'), secret, body)].pack('m0').strip

    unless Rack::Utils.secure_compare(signature, given_signature)
      Rails.logger.warn "tito-signature: mismatch; given=#{given_signature.inspect}, expected:#{signature.inspect}" # TODO: Raven
      return render(status: 406, json: {status: :signature_invalid})
    end
  end

end
