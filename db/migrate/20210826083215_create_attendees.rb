class CreateAttendees < ActiveRecord::Migration[6.1]
  def change
    create_table :attendees do |t|
      t.references :ticket, null: false, foreign_key: true
      t.string :name, null: false
      t.string :gravatar_hash, null: false
      t.boolean :ready, null: false, default: false
      t.boolean :is_staff, null: false, default: false
      t.boolean :is_speaker, null: false, default: false
      t.boolean :is_committer, null: false, default: false
      t.boolean :is_sponsor, null: false, default: false
      t.datetime :voided_at

      t.timestamps
    end
  end
end
