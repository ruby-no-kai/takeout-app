class AddVersionToChimeUser < ActiveRecord::Migration[6.1]
  def change
    add_column :chime_users, :version, :integer, null: false, default: 0
  end
end
