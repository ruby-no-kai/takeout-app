source 'https://rubygems.org'
ruby '~> 3.0.1' if ENV['STACK'] || ENV['IS_HEROKU']

gem 'rails', '~> 6.1.4'
gem 'pg', '~> 1.1'
gem 'puma', '~> 5.0'
gem 'sass-rails', '>= 6'

gem 'jsonnet'
gem 'jwt'

gem 'aws-sdk-core' # sts
gem 'aws-sdk-s3'
gem 'aws-sdk-chimesdkidentity'
gem 'aws-sdk-chimesdkmessaging'
gem 'aws-sdk-ivs'

gem 'simpacker'
gem 's3_assets_uploader'

gem 'http-2'
gem 'aws-sdk-transcribestreamingservice'

gem "sentry-ruby"
gem "sentry-rails"

group :development, :test do
  gem 'byebug', platforms: [:mri, :mingw, :x64_mingw]
end

group :development do
  gem 'listen', '~> 3.3'
end
