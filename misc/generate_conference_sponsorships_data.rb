require 'csv'
require 'yaml'
require 'json'
require 'uri'

# takes CSV (Timestamp,Email,Sponsor Name,Text,sponsor_app_id) and  sponsors.yml (see ruby-no-kai/sponsor-app) and generate ConferenceSponsorship data in JSON

csv_path, yml_path = ARGV[0,2]

unless csv_path && yml_path
  abort "usage: #$0 csv_path yml_path"
end

PromoText = Struct.new(:org_domain, :name, :text, :sponsor_app_id, keyword_init: true)

promo_texts = {}
CSV.open(csv_path, headers: true) do |csv|
  csv.each do |row|
    org_domain =  row.fetch('Email Address').split(?@,2)[1].strip
    promo_texts[row.fetch('sponsor_app_id') || org_domain] = PromoText.new(
      org_domain:,
      name: row.fetch('Sponsor Name').strip,
      text: row.fetch('Text').strip,
      sponsor_app_id: row.fetch('sponsor_app_id') || org_domain,
    )
  end
end


sponsor_data = YAML.load(File.read(yml_path))
plans = sponsor_data.each_value.select { |plan| %w(platinum ruby).include?(plan.fetch(:base_plan)) }

eligible_sponsors = plans.flat_map{ |_| _.fetch(:plans).each_value.flat_map { |__| __.fetch(:sponsors) } }

result = []
eligible_sponsors.each do |sponsor|
  id = sponsor.fetch(:id).to_s
  promo = promo_texts[id] || promo_texts[sponsor.fetch(:slug)]

  if promo && sponsor.fetch(:slug) != promo.org_domain
    warn "WARN sponsor_id=#{id} (#{sponsor.fetch(:slug)}), #{promo.inspect}"
  end

  if promo
    text =[promo.name,promo.text].join
    urls = URI.extract(text)
    if urls.size > 1
      warn "WARN #{sponsor.fetch(:slug)} urls=#{urls.inspect}"
    end
    text_wo_url = urls.inject(text) { |r,i| r.gsub(/#{Regexp.escape(i)}/, '') }
    len = text_wo_url.size
    if len > 150
      warn "WARN #{sponsor.fetch(:slug)} length=#{len}"
    end
  end

  result.push(
    sponsor_app_id: id,
    avatar_url: "https://rubykaigi.org/2022/images/sponsors/#{sponsor.fetch(:asset_file_id)}_#{sponsor.fetch(:base_plan)}@3x.png",
    large_display: %(ruby).include?(sponsor.fetch(:base_plan)),
    name: promo&.name || sponsor.fetch(:name),
    promo: promo&.text,
  )
end

puts JSON.pretty_generate({conference_sponsorships: result})

