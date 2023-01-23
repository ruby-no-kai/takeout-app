Rails.application.routes.draw do
  post 'tito_webhook' => 'tito_webhook#create'


  get '/' => 'frontend#index'

  %w(
    /session/new
    /control/session/new

    /screen
    /subscreen/:slug
  ).each do |_|
    get _ => 'frontend#show'
  end

  %w(
    /
    /tracks/:id
    /attendee
  ).each do |_|
    get _ => 'frontend#show_require_attendee'
  end

  %w(
    /control
    /control/attendees
    /control/attendees/:id
    /control/track_cards
    /control/chat_spotlights
    /control/stream_presences
    /control/screen
    /control/next_session
    /control/tracks/:slug
    /control/venue_announcements
  ).each do |_|
    get _ => 'frontend#show_require_control'
  end

  resources :avatars, only: %i(show), param: :handle

  scope path: 'control', module: 'control' do
    get 'chime_users/:handle' => 'chime_users#lookup'
  end

  scope path: 'api', module: 'api' do
    resource :app_version, only: %i(show)

    resource :session, only: %i(show create destroy) do
      post :take_control
      post :use_kiosk
    end

    resource :attendee, only: %i(update)

    resource :conference, only: %i(show)

    resources :streams, only: %i(show), param: :track_slug
    resource :chat_session, only: %i(show)

    resources :tracks, param: :slug, only: %i() do
      resources :chat_messages, only: %i(create)
      resource :chat_message_pin, only: %i(show)
      resource :chat_admin_message_pin, only: %i(update)
      resource :caption_chat_membership, only: %i(create destroy)
    end

    resources :conference_sponsorships, only: %i(index)
    resources :venue_announcements, only: %i(index)

    scope path: 'control', module: 'control' do
      resource :conference, only: %i(show)

      resources :tracks, param: :slug, only: %i() do
        resources :track_cards, only: %i(index create update destroy), path: 'cards'
        resources :chat_spotlights, only: %i(index create update destroy)
        resource :stream_presence, only: %i(show update), path: 'stream_presence'
      end

      resource :next_session, only: %i(create)

      resources :control_collerations, only: %i(show destroy)
      resources :venue_announcements, only: %i(index destroy create update)

      resources :attendees, only: %i(index show update)
    end
  end

  get '/healthz' => RevisionPlate::App.new

  if Rails.env.development? || ENV['TAKEOUT_ENABLE_OUTPOST_LOCAL'] == '1'
    mount OutpostLocal, at: '/outpost'
  end
end
