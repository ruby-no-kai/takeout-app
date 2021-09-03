class Ticket < ApplicationRecord
  has_many :attendees, dependent: :destroy # includes voided attendees

  def as_json
    {
      id: id,
      tito_id: tito_id,
      slug: slug,
      reference: reference,
      state: state,
      first_name: first_name,
      last_name: last_name,
      release_slug: release_slug,
      release_title: release_title,
      admin_url: admin_url,
      tito_updated_at: tito_updated_at&.to_i,
    }
  end

  def active_attendee
    attendees.active.first
  end

  def build_attendee
    attendee = self.attendees.build(
      name: "#{first_name} #{last_name}",
      gravatar_email: email,
      ready: false,
    )
    attendee.assign_inferred_role
    attendee
  end
end
