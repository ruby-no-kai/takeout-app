# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2021_08_26_083215) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "attendees", force: :cascade do |t|
    t.bigint "ticket_id", null: false
    t.string "name", null: false
    t.string "gravatar_hash", null: false
    t.boolean "ready", default: false, null: false
    t.boolean "is_staff", default: false, null: false
    t.boolean "is_speaker", default: false, null: false
    t.boolean "is_committer", default: false, null: false
    t.boolean "is_sponsor", default: false, null: false
    t.datetime "voided_at"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["ticket_id"], name: "index_attendees_on_ticket_id"
  end

  create_table "tickets", force: :cascade do |t|
    t.integer "tito_id", null: false
    t.string "slug", null: false
    t.string "reference", null: false
    t.string "state", null: false
    t.string "email"
    t.string "first_name"
    t.string "last_name"
    t.boolean "assigned"
    t.string "registration_slug"
    t.string "registration_"
    t.string "discount_code_used"
    t.string "release_slug"
    t.string "release_title"
    t.string "admin_url"
    t.datetime "tito_updated_at"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["discount_code_used"], name: "index_tickets_on_discount_code_used"
    t.index ["email", "reference"], name: "index_tickets_on_email_and_reference"
    t.index ["reference"], name: "index_tickets_on_reference"
    t.index ["tito_id"], name: "index_tickets_on_tito_id", unique: true
  end

  add_foreign_key "attendees", "tickets"
end
