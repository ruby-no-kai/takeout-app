class CreateConferencePresentations < ActiveRecord::Migration[6.1]
  def change
    create_table :conference_presentations do |t|
      t.string :slug, null: false, unique: true
      t.string :title, null: false
      t.string :kind, null: false
      t.string :language, null: false
      t.text :description, null: false, default: ''
      t.string :speaker_slugs, array: true, null: false, default: []

      t.timestamps
    end
  end
end
