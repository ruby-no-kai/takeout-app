Rails.application.routes.draw do
  post 'tito_webhook' => 'tito_webhook#create'

  %w(
    /
    /session/new
    /tracks/:id
    /attendee
  ).each do |_|
    get _ => 'frontend#show'
  end

  scope path: 'api', module: 'api' do
    resource :session, only: %i(show create destroy)
  end
end
