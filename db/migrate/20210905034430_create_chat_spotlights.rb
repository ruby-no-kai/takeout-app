class CreateChatSpotlights < ActiveRecord::Migration[6.1]
  def change
    create_table :chat_spotlights do |t|
      t.string :track, null: false
      t.datetime :starts_at, null: false
      t.datetime :ends_at
      t.string :handles, array: true, null: false, default: []

      t.timestamps
    end

    add_index :chat_spotlights, [:track, :starts_at]
    add_index :chat_spotlights, :starts_at
  end
end
