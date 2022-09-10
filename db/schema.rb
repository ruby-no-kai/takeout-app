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

ActiveRecord::Schema[7.0].define(version: 2022_09_09_043148) do
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
    t.datetime "voided_at", precision: nil
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "presentation_slugs", default: [], null: false, array: true
    t.index ["ticket_id"], name: "index_attendees_on_ticket_id"
  end

  create_table "chat_message_pins", force: :cascade do |t|
    t.string "track", null: false
    t.json "content"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["track"], name: "index_chat_message_pins_on_track", unique: true
  end

  create_table "chat_spotlights", force: :cascade do |t|
    t.string "track", null: false
    t.datetime "starts_at", precision: nil, null: false
    t.datetime "ends_at", precision: nil
    t.string "handles", default: [], null: false, array: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "control_colleration_id"
    t.index ["control_colleration_id"], name: "index_chat_spotlights_on_control_colleration_id"
    t.index ["starts_at"], name: "index_chat_spotlights_on_starts_at"
    t.index ["track", "starts_at"], name: "index_chat_spotlights_on_track_and_starts_at"
  end

  create_table "chime_users", force: :cascade do |t|
    t.bigint "attendee_id"
    t.boolean "ready", default: false, null: false
    t.string "handle", null: false
    t.string "name", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "version", default: 0, null: false
    t.index ["attendee_id"], name: "index_chime_users_on_attendee_id"
    t.index ["handle"], name: "index_chime_users_on_handle", unique: true
  end

  create_table "conference_presentations", force: :cascade do |t|
    t.string "slug", null: false
    t.string "title", null: false
    t.string "kind", null: false
    t.string "language", null: false
    t.text "description", default: "", null: false
    t.string "speaker_slugs", default: [], null: false, array: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "live"
    t.index ["slug"], name: "index_conference_presentations_on_slug", unique: true
  end

  create_table "conference_speakers", force: :cascade do |t|
    t.string "slug", null: false
    t.string "name", null: false
    t.text "bio", default: "", null: false
    t.string "github_id"
    t.string "twitter_id"
    t.string "gravatar_hash"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["slug"], name: "index_conference_speakers_on_slug", unique: true
  end

  create_table "conference_sponsorships", force: :cascade do |t|
    t.string "sponsor_app_id", null: false
    t.string "avatar_url", null: false
    t.string "name", null: false
    t.boolean "large_display", default: false, null: false
    t.text "promo"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["sponsor_app_id"], name: "index_conference_sponsorships_on_sponsor_app_id", unique: true
  end

  create_table "control_collerations", force: :cascade do |t|
    t.string "description", default: "", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "stream_presences", force: :cascade do |t|
    t.string "track", null: false
    t.string "kind", null: false
    t.boolean "online", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["track", "kind"], name: "index_stream_presences_on_track_and_kind", unique: true
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
    t.datetime "tito_updated_at", precision: nil
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.json "metadata", default: {}, null: false
    t.index ["discount_code_used"], name: "index_tickets_on_discount_code_used"
    t.index ["email", "reference"], name: "index_tickets_on_email_and_reference"
    t.index ["reference"], name: "index_tickets_on_reference"
    t.index ["tito_id"], name: "index_tickets_on_tito_id", unique: true
  end

  create_table "track_cards", force: :cascade do |t|
    t.string "track"
    t.datetime "activation_at", precision: nil
    t.json "content"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "pending_candidate_emit", default: false, null: false
    t.bigint "control_colleration_id"
    t.index ["control_colleration_id"], name: "index_track_cards_on_control_colleration_id"
    t.index ["track", "activation_at"], name: "index_track_cards_on_track_and_activation_at", unique: true, order: { activation_at: :desc }
  end

  create_table "venue_announcements", force: :cascade do |t|
    t.text "content", default: "", null: false
    t.boolean "enabled", default: false, null: false
    t.boolean "only_intermission", default: false, null: false
    t.boolean "only_signage", default: false, null: false
    t.boolean "only_subscreen", default: false, null: false
    t.integer "order_index", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["enabled", "order_index"], name: "index_venue_announcements_on_enabled_and_order_index"
  end

  add_foreign_key "attendees", "tickets"
  add_foreign_key "chat_spotlights", "control_collerations"
  add_foreign_key "chime_users", "attendees"
  add_foreign_key "track_cards", "control_collerations"
end
