require "active_support/core_ext/integer/time"

Rails.application.configure do
  # Settings specified here will take precedence over those in config/application.rb.
  unless ENV['STACK'] # not during heroku build
    config.x.tito.webhook_secret = ENV.fetch('TITO_WEBHOOK_SECRET')
    config.x.ivs.private_key = ENV.fetch('IVS_PRIVATE_KEY').yield_self { |der| OpenSSL::PKey::EC.new(der.unpack1('m*'), '') }
    config.x.staff_only = ENV['TAKEOUT_STAFF_ONLY'] == '1'
    config.x.staff_only_stream = ENV['TAKEOUT_STAFF_ONLY_STREAM'] == '1'

    config.x.default_avatar_url = 'https://takeout.rubykaigi.org/assets/dummy-avatar.jpg'
    config.x.avatar_prefix = ENV.fetch('TAKEOUT_AVATAR_PREFIX', nil) # TODO:

    config.x.chime.user_role_arn = ENV.fetch('TAKEOUT_USER_ROLE_ARN')
    config.x.chime.use_oidc = ENV['TAKEOUT_CHIME_USE_OIDC'] == '1'

    config.x.s3.public_bucket = ENV.fetch('TAKEOUT_S3_BUCKET')
    config.x.s3.public_prefix = ENV.fetch('TAKEOUT_S3_PREFIX')
    config.x.s3.public_region = ENV.fetch('TAKEOUT_S3_REGION')

    config.x.control.password = ENV.fetch('TAKEOUT_CONTROL_PASSWORD')
    config.x.kiosk.password = ENV.fetch('TAKEOUT_KIOSK_PASSWORD')

    config.x.oidc.signing_key = ENV.fetch('OIDC_SIGNING_KEY').yield_self { |der| OpenSSL::PKey::RSA.new(der.unpack1('m*'), '') }

    config.x.sentry.dsn = ENV['SENTRY_DSN']
    config.x.release_meta.commit = ENV['HEROKU_SLUG_COMMIT'] || ENV['RELEASE_COMMIT'] || Rails.root.join('REVISION').then { _1.exist? ? _1.read : nil } || 'COMMIT_UNKNOWN'
    config.x.release_meta.version = ENV['HEROKU_RELEASE_VERSION']
    config.x.release_meta.cache_buster = ENV['TAKEOUT_CACHE_BUSTER']
  end

  config.active_job.queue_adapter = ENV.fetch('ENABLE_SHORYUKEN', '1') == '1' ? :shoryuken : :inline

  # Code is not reloaded between requests.
  config.cache_classes = true

  # Eager load code on boot. This eager loads most of Rails and
  # your application in memory, allowing both threaded web servers
  # and those relying on copy on write to perform better.
  # Rake tasks automatically ignore this option for performance.
  config.eager_load = true

  # Full error reports are disabled and caching is turned on.
  config.consider_all_requests_local       = false
  config.action_controller.perform_caching = true

  # Ensures that a master key has been made available in either ENV["RAILS_MASTER_KEY"]
  # or in config/master.key. This key is used to decrypt credentials (and other encrypted files).
  # config.require_master_key = true

  # Disable serving static files from the `/public` folder by default since
  # Apache or NGINX already handles this.
  config.public_file_server.enabled = ENV['RAILS_SERVE_STATIC_FILES'].present?

  # Compress CSS using a preprocessor.
  # config.assets.css_compressor = :sass

  # Do not fallback to assets pipeline if a precompiled asset is missed.
  config.assets.compile = false

  # Enable serving of images, stylesheets, and JavaScripts from an asset server.
  # config.asset_host = 'http://assets.example.com'

  # Specifies the header that your server uses for sending files.
  # config.action_dispatch.x_sendfile_header = 'X-Sendfile' # for Apache
  # config.action_dispatch.x_sendfile_header = 'X-Accel-Redirect' # for NGINX

  # Force all access to the app over SSL, use Strict-Transport-Security, and use secure cookies.
  config.force_ssl = true
  config.ssl_options = { hsts: { subdomains: false } }

  # Include generic and useful information about system operation, but avoid logging too much
  # information to avoid inadvertent exposure of personally identifiable information (PII).
  config.log_level = :info

  # Prepend all log lines with the following tags.
  config.log_tags = [ :request_id ]

  # Use a different cache store in production.
  # config.cache_store = :mem_cache_store


  # Enable locale fallbacks for I18n (makes lookups for any locale fall back to
  # the I18n.default_locale when a translation cannot be found).
  config.i18n.fallbacks = true

  # Send deprecation notices to registered listeners.
  config.active_support.deprecation = :notify

  # Don't log any deprecations.
  config.active_support.report_deprecations = false

  # Use default logging formatter so that PID and timestamp are not suppressed.
  config.log_formatter = ::Logger::Formatter.new

  # Use a different logger for distributed setups.
  # require "syslog/logger"
  # config.logger = ActiveSupport::TaggedLogging.new(Syslog::Logger.new 'app-name')

  if ENV["RAILS_LOG_TO_STDOUT"].present?
    logger           = ActiveSupport::Logger.new(STDOUT)
    logger.formatter = config.log_formatter
    config.logger    = ActiveSupport::TaggedLogging.new(logger)
  end

  # Do not dump schema after migrations.
  config.active_record.dump_schema_after_migration = false

  config.session_store(:cookie_store,
    expire_after: 14.days,
    key: '__Host-rk-takeout-sess',
    same_site: :lax,
    secure: true,
  )

  # Inserts middleware to perform automatic connection switching.
  # The `database_selector` hash is used to pass options to the DatabaseSelector
  # middleware. The `delay` is used to determine how long to wait after a write
  # to send a subsequent read to the primary.
  #
  # The `database_resolver` class is used by the middleware to determine which
  # database is appropriate to use based on the time delay.
  #
  # The `database_resolver_context` class is used by the middleware to set
  # timestamps for the last write to the primary. The resolver uses the context
  # class timestamps to determine how long to wait before reading from the
  # replica.
  #
  # By default Rails will store a last write timestamp in the session. The
  # DatabaseSelector middleware is designed as such you can define your own
  # strategy for connection switching and pass that into the middleware through
  # these configuration options.
  # config.active_record.database_selector = { delay: 2.seconds }
  # config.active_record.database_resolver = ActiveRecord::Middleware::DatabaseSelector::Resolver
  # config.active_record.database_resolver_context = ActiveRecord::Middleware::DatabaseSelector::Resolver::Session
end
