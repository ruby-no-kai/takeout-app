class CreateAttendees < ActiveRecord::Migration[6.1]
  def change
    create_table :attendees do |t|
      t.references :ticket, null: false, foreign_key: true
      t.string :name
      t.string :gravatar_hash
      t.boolean :is_staff
      t.boolean :is_speaker
      t.boolean :is_committer
      t.boolean :is_sponsor
      t.datetime :voided_at

      t.timestamps
    end
  end
end
