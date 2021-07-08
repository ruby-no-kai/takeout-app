class CreateTickets < ActiveRecord::Migration[6.1]
  def change
    create_table :tickets do |t|
      t.integer :tito_id, null: false
      t.string :slug, null: false
      t.string :reference, null: false
      t.string :state, null: false
      t.string :email
      t.string :first_name
      t.string :last_name
      t.string :registration_slug
      t.string :discount_code_used
      t.string :release_slug
      t.string :release_title

      t.datetime :registered_at

      t.timestamps
    end

    add_index :tickets, :tito_id, unique: true
    add_index :tickets, [:email, :reference]
    add_index :tickets, :reference
    add_index :tickets, :discount_code_used
  end
end
