data "external" "conference" {
  program = ["ruby", "${path.module}/conference_arns.rb", "${path.module}/../config/conference.jsonnet"]
}
