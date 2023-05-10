class CreateKioskHeartbeats < ActiveRecord::Migration[7.0]
  def change
    create_table :kiosk_heartbeats do |t|
      t.string :name, null: false
      t.string :version, null: false
      t.datetime :last_heartbeat_at
      t.datetime :last_checkin_at

      t.timestamps
    end
    add_index :kiosk_heartbeats, :name, unique: true
  end
end
