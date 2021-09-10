namespace :takeout do
  task :rotate_promo, [:continue_id, :track] => :environment  do |_t, args|
    sponsors = ConferenceSponsorship.all.order(sponsor_app_id: :asc)

    tracks = args[:track].present? ? [args[:track]] : Conference.track_slugs
    continue_id = args[:continue_id]
    p continue_id: continue_id
    skip = !!continue_id

    next_continue_id = nil
    begin
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

          tracks.each do |track|
            ChatMessagePin.set(track, message)
          end

          next_continue_id = s.id
          sleep 20
        end
      end
    rescue Interrupt => e
      p e
      tracks.each do |track|
        ChatMessagePin.set(track, nil)
      end
      p :_____________
      p :_____________
      p :_____________
      p next_continue_id: next_continue_id
    end
  end
end
