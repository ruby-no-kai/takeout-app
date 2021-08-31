class CreateConferenceSpeakers < ActiveRecord::Migration[6.1]
  def change
    create_table :conference_speakers do |t|
      t.string :slug, null: false, unique: true
      t.string :name, null: false
      t.text :bio, null: false, default: ''
      t.string :github_id
      t.string :twitter_id
      t.string :gravatar_hash

      t.timestamps
    end
  end
end
