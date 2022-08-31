class CreateControlCollerations < ActiveRecord::Migration[7.0]
  def change
    create_table :control_collerations do |t|
      t.string :description, null: false, default: ''

      t.timestamps
    end

    add_reference :track_cards, :control_colleration, foreign_key: true, null: true
    add_reference :chat_spotlights, :control_colleration, foreign_key: true, null: true
  end
end
