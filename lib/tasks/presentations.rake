namespace :takeout do
  task :sync_conference_data => :environment do
    SyncConferenceDataJob.perform_now()
  end
end
