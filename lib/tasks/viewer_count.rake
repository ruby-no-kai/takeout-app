namespace :takeout do
  task :viewer_count  => :environment  do
    loop do
      EmitViewerCountJob.perform_now
      sleep 30
    end
  end
end
