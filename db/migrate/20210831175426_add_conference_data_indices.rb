class AddConferenceDataIndices < ActiveRecord::Migration[6.1]
  def change
    add_index :conference_presentations, :slug, unique: true
    add_index :conference_speakers, :slug, unique: true
  end
end
