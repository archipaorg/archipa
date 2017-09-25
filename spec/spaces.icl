take apps

space "machinabot" {
    description = "A Smart Relay Gateway Designed for Bots"
    apps = [app.service-cassandra-seed, app.service-solr, app.service-frontend, app.service-proxy, app.service-geo]
}