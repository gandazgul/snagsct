FROM jekyll/builder as build

COPY . /app
WORKDIR /app

RUN chmod a+w Gemfile.lock
RUN bundle install
RUN jekyll build

FROM jekyll/minimal

COPY --from=build /app/_site /app
RUN chown -R 1000:1000 /app

WORKDIR /app

CMD ["jekyll", "serve"]
