Rails.application.routes.draw do
  post 'tito_webhook' => 'tito_webhook#create'

  %w(
    /
    /session/new
    /control/session/new
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
    /control/track_cards
  ).each do |_|
    get _ => 'frontend#show_require_control'
  end

  resources :avatars, only: %i(show), param: :handle

  scope path: 'api', module: 'api' do
    resource :session, only: %i(show create destroy) do
      post :take_control
    end

    resource :attendee, only: %i(update)

    resource :conference, only: %i(show)

    resources :streams, only: %i(show), param: :track_slug
    resource :chat_session, only: %i(show)

    resources :tracks, param: :slug, only: %i() do
      resources :chat_admin_messages, only: %i(create)
      resource :chat_message_pin, only: %i(show)
      resource :chat_admin_message_pin, only: %i(update)
    end

    scope path: 'control', module: 'control' do
      resource :conference, only: %i(show)

      resources :tracks, param: :slug, only: %i() do
        resources :track_cards, only: %i(index create update destroy), path: 'cards'
      end
    end
  end
end
