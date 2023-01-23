FROM public.ecr.aws/docker/library/node:18-bullseye-slim as nodebuilder
WORKDIR /app

COPY package.json /app/
COPY package-lock.json /app/
RUN npm install

COPY . /app/
RUN npm run build

###

FROM public.ecr.aws/sorah/ruby:3.1-dev as builder

RUN apt-get update \
    && apt-get install -y libpq-dev git-core \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY Gemfile /app/
COPY Gemfile.lock /app/

RUN bundle install --path /gems --jobs 100 --deployment --without development

###

FROM public.ecr.aws/sorah/ruby:3.1

RUN apt-get update \
    && apt-get install -y libpq5 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=builder /gems /gems
COPY --from=builder /app/.bundle /app/.bundle
COPY --from=nodebuilder /app/public/packs /app/public/packs
COPY . /app/

ENV PORT 3000
ENV LANG C.UTF-8
CMD ["bundle", "exec", "puma", "-C", "/etc/puma.rb"]
