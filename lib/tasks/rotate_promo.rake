namespace :takeout do
  task :rotate_promo, [:continue_id] => :environment  do |_t, args|
    sponsors = ConferenceSponsorship.all.order(sponsor_app_id: :asc)

    continue_id = args[:continue_id]
    p continue_id: continue_id
    skip = !!continue_id

    loop do
      sponsors.each do |s|
        if skip && s.id == continue_id.to_i
          skip = false 
          next
        end
        next if skip

        message = s.as_chat_message
        next unless message

        p [s.id, message]

        Conference.track_slugs.each do |track|
          ChatMessagePin.set(track, message)
        end

        sleep 20
      end
    end
  end
end
