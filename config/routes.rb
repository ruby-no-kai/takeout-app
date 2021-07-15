Rails.application.routes.draw do
  post 'tito_webhook' => 'tito_webhook#create'
end
