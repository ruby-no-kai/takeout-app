class AddMetadataToTicket < ActiveRecord::Migration[7.0]
  def change
    add_column :tickets, :metadata, :json, default: {}, null: false
  end
end
