Rails.application.routes.draw do
  post 'tito_webhook' => 'tito_webhook#create'

  %w(
    /
    /session/new
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

  scope path: 'api', module: 'api' do
    resource :session, only: %i(show create destroy)
    resource :attendee, only: %i(update)

    resource :conference, only: %i(show)

    resources :streams, only: %i(show), param: :track_slug
  end
end
