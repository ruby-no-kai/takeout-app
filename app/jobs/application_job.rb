class ApplicationJob < ActiveJob::Base
  queue_as ENV["TAKEOUT_SHORYUKEN_QUEUE"] if ENV["TAKEOUT_SHORYUKEN_QUEUE"]
end
