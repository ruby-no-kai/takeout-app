class Conference
  DATA = ActiveSupport::HashWithIndifferentAccess.new(Jsonnet.load(Rails.root.join('config', 'conference.jsonnet')))

  def self.data
    DATA.fetch Rails.env.to_s
  end

  def self.to_h
    data
  end
end
