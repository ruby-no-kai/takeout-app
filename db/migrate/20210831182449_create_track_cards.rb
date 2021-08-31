class CreateTrackCards < ActiveRecord::Migration[6.1]
  def change
    create_table :track_cards do |t|
      t.string :track
      t.datetime :activation_at
      t.json :content

      t.timestamps
    end

    add_index :track_cards, [:track, :activation_at], order: {track: :asc, activation_at: :desc}, unique: true
  end
end
