Rails.application.routes.draw do
  post 'tito_webhook' => 'tito_webhook#create'


  get '/' => 'frontend#index'

  %w(
    /session/new
    /control/session/new

    /screen
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
    /control/stream_presences
    /control/screen
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

    scope path: 'control', module: 'control' do
      resource :conference, only: %i(show)

      resources :tracks, param: :slug, only: %i() do
        resources :track_cards, only: %i(index create update destroy), path: 'cards'
        resource :stream_presence, only: %i(show update), path: 'stream_presence'
      end

      resources :control_collerations, only: %i(show destroy)

      resources :attendees, only: %i(index show update)
    end
  end
end
