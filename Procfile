release: bundle exec rake db:migrate assets:upload
web: bundle exec puma -p $PORT -C config/puma.rb
worker: bundle exec shoryuken start -R -C config/shoryuken.yml
