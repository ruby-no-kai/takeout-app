class CreateChatMessagePins < ActiveRecord::Migration[6.1]
  def change
    create_table :chat_message_pins do |t|
      t.string :track, null: false
      t.json :content

      t.timestamps
    end

    add_index :chat_message_pins, :track, unique: true
  end
end
