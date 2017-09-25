take settings

app "service-cassandra-seed" from cassandra_image {

}

app "service-cassandra-online-ams-1" from cassandra_image {
    network "dns" "alias" table "service-cassandra-seed" = app.service-cassandra-seed
}

app "service-solr"  from base_image "library/solr:6.5" {
    command    = ["mkdir -p tmp && wget -L -O tmp/repo.zip https://www.dropbox.com/s/6nz07erbywghcpm/solr.zip?dl=1 && unzip -q tmp/repo.zip -d tmp >/dev/null && tmp/secure.sh && tmp/init.sh &! (docker-entrypoint.sh && solr-foreground)"]
    entrypoint = ["/bin/sh", "-c"]
    configuration "environment" table "INIT_BLY_SOLR_CORE" = "true"
    metadata "labels"           table "io.rancher.container.pull_image" = "always"
}

app "service-frontend" from app_image "chermah.ddns.net:8082/machina-web:0.0.2" {

}

app "service-proxy" from app_image "chermah.ddns.net:8082/machina-proxy:0.0.1" {
     metadata "labels" table "io.rancher.scheduler.affinity:container_label_soft_ne: io.rancher.stack_service.name" = "$${stack_name}/$${service_name}"
                             "io.rancher.container.hostname_override" = "container_name"
                             "io.rancher.container.pull_image"        = "always"
}

app "service-geo" from base_image "90.79.83.46:8082/geo:1.0.0" {
    command = ["/usr/bin/supervisord", "-c", "/etc/supervisor/supervisord.conf"],
    working_dir = ["/opt/bly-geo/src"],
    configuration "environment" table "PATH" = "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
    metadata "labels"           table "io.rancher.container.pull_image" = "always"
}

