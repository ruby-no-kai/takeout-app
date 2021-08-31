class AddPendingCandidateEmitToTrackCard < ActiveRecord::Migration[6.1]
  def change
    add_column :track_cards, :pending_candidate_emit, :boolean, null: false, default: false
  end
end
