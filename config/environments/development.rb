require "active_support/core_ext/integer/time"

Rails.application.configure do
  # Settings specified here will take precedence over those in config/application.rb.
  config.x.tito.webhook_secret = ENV['TITO_WEBHOOK_SECRET']
  config.x.ivs.private_key = ENV.fetch('IVS_PRIVATE_KEY', nil)&.yield_self { |der| OpenSSL::PKey::EC.new(der.unpack1('m*'), '') }
  config.x.staff_only = ENV['TAKEOUT_STAFF_ONLY'] == '1'
  config.x.chime.user_role_arn = ENV['TAKEOUT_USER_ROLE_ARN']
  config.x.default_avatar_url = 'https://rubykaigi.org/2021-takeout/images/dummy-avater.png'
  config.x.avatar_prefix = ENV['TAKEOUT_AVATAR_PREFIX']
  config.x.s3.public_bucket = ENV['TAKEOUT_S3_BUCKET'] || 'rk-takeout-app'
  config.x.s3.public_prefix = ENV['TAKEOUT_S3_PREFIX'] || 'dev/'
  config.x.s3.public_region = ENV['TAKEOUT_S3_REGION'] || 'ap-northeast-1'

  config.active_job.queue_adapter = ENV.fetch('ENABLE_SHORYUKEN', '1') == '1' ? :inline : :shoryuken

  # In the development environment your application's code is reloaded any time
  # it changes. This slows down response time but is perfect for development
  # since you don't have to restart the web server when you make code changes.
  config.cache_classes = false

  # Do not eager load code on boot.
  config.eager_load = false

  # Show full error reports.
  config.consider_all_requests_local = true

  # Enable/disable caching. By default caching is disabled.
  # Run rails dev:cache to toggle caching.
  if Rails.root.join('tmp', 'caching-dev.txt').exist?
    config.action_controller.perform_caching = true
    config.action_controller.enable_fragment_cache_logging = true

    config.cache_store = :memory_store
    config.public_file_server.headers = {
      'Cache-Control' => "public, max-age=#{2.days.to_i}"
    }
  else
    config.action_controller.perform_caching = false

    config.cache_store = :null_store
  end

  # Print deprecation notices to the Rails logger.
  config.active_support.deprecation = :log

  # Raise exceptions for disallowed deprecations.
  config.active_support.disallowed_deprecation = :raise

  # Tell Active Support which deprecation messages to disallow.
  config.active_support.disallowed_deprecation_warnings = []

  # Raise an error on page load if there are pending migrations.
  config.active_record.migration_error = :page_load

  # Highlight code that triggered database queries in logs.
  config.active_record.verbose_query_logs = true

  # Debug mode disables concatenation and preprocessing of assets.
  # This option may cause significant delays in view rendering with a large
  # number of complex assets.
  config.assets.debug = true

  # Suppress logger output for asset requests.
  config.assets.quiet = true

  # Raises error for missing translations.
  # config.i18n.raise_on_missing_translations = true

  # Annotate rendered view with file names.
  # config.action_view.annotate_rendered_view_with_filenames = true

  # Use an evented file watcher to asynchronously detect changes in source code,
  # routes, locales, etc. This feature depends on the listen gem.
  config.file_watcher = ActiveSupport::EventedFileUpdateChecker

  # Uncomment if you wish to allow Action Cable access from any origin.
  # config.action_cable.disable_request_forgery_protection = true
  config.hosts << /[a-z0-9]+\.ngrok\.io/
end
