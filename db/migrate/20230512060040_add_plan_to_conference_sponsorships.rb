class AddPlanToConferenceSponsorships < ActiveRecord::Migration[7.0]
  def change
    add_column :conference_sponsorships, :plan, :string
  end
end
