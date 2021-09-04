class AddPresentationSlugsToAttendees < ActiveRecord::Migration[6.1]
  def change
    add_column :attendees, :presentation_slugs, :string, array: true, default: [], null: false
  end
end
