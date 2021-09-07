class CreateStreamPresences < ActiveRecord::Migration[6.1]
  def change
    create_table :stream_presences do |t|
      t.string :track, null: false
      t.string :kind, null: false
      t.boolean :online, null: false, default: false

      t.timestamps
    end

    add_index :stream_presences, [:track,:kind], unique: true
  end
end
