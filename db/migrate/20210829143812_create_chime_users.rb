class CreateChimeUsers < ActiveRecord::Migration[6.1]
  def change
    create_table :chime_users do |t|
      t.references :attendee, foreign_key: true, null: true, unique: true
      t.boolean :ready, null: false, default: false
      t.string :handle, null: false
      t.string :name, null: false

      t.timestamps
    end

    add_index :chime_users, :handle, unique: true
  end
end
