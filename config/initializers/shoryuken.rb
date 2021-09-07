module Shoryuken
  module Middleware
    module Server
      class RavenReporter
        def call(worker_instance, queue, sqs_msg, body)
          #tags = {}
          #context = { message: body }
          Sentry.with_scope do |scope|
            scope.set_transaction_name(body['job_class'])
            scope.set_tags( job: body['job_class'], queue: queue )
            begin
              yield
            rescue Exception => e
              Sentry.capture_exception(e)
              raise
            end
          end
        end
      end
    end
  end
end

Shoryuken.active_job_queue_name_prefixing = false

if ENV['TAKEOUT_SHORYUKEN_QUEUE']
  Shoryuken.configure_client do |config|
    config.sqs_client = Aws::SQS::Client.new(region: ENV.fetch('TAKEOUT_SHORYUKEN_AWS_REGION'), logger: Rails.logger)
  end
  Shoryuken.configure_server do |config|
    config.server_middleware do |chain|
      chain.add Shoryuken::Middleware::Server::RavenReporter
    end

    config.sqs_client = Aws::SQS::Client.new(region: ENV.fetch('TAKEOUT_SHORYUKEN_AWS_REGION'), logger: Rails.logger)
    # see also config/shoryuken.yml
    config.sqs_client_receive_message_opts = { wait_time_seconds: 20 } 
  end
end
