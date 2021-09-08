class CreateConferenceSponsorships < ActiveRecord::Migration[6.1]
  def change
    create_table :conference_sponsorships do |t|
      t.string :sponsor_app_id, null: false
      t.string :avatar_url, null: false
      t.string :name, null: false
      t.boolean :large_display, null: false, default: false
      t.text :promo

      t.timestamps
    end

    add_index :conference_sponsorships, :sponsor_app_id, unique: true
  end
end
