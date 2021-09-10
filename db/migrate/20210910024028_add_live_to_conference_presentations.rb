class AddLiveToConferencePresentations < ActiveRecord::Migration[6.1]
  def change
    add_column :conference_presentations, :live, :boolean
  end
end
