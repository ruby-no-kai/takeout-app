namespace :takeout do
  task :rotate_promo => :environment do 
    sponsors = ConferenceSponsorship.all.order(sponsor_app_id: :asc)

    loop do
      sponsors.each do |s|
        message = s.as_chat_message
        next unless message

        p message

        Conference.track_slugs.each do |track|
          ChatMessagePin.set(track, message)
        end

        sleep 20
      end
    end
  end
end
