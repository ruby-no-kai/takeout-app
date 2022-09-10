class CreateVenueAnnouncements < ActiveRecord::Migration[7.0]
  def change
    create_table :venue_announcements do |t|
      t.text :content, null: false, default: ''
      t.boolean :enabled, null: false, default: false
      t.boolean :only_intermission, null: false, default: false
      t.boolean :only_signage, null: false, default: false
      t.boolean :only_subscreen, null: false, default: false
      t.integer :order_index, null: false, default: 0

      t.timestamps
    end

    add_index :venue_announcements, [:enabled, :order_index]
  end
end
