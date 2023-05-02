class AddUrlToVenueAnnouncement < ActiveRecord::Migration[7.0]
  def change
    add_column :venue_announcements, :url, :string
  end
end
