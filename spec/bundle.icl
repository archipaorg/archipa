app "service-frontend" from image @"chermah.ddns.net:8082/helloworld:1.0.0" {

   configuration "environment" table "init_on_start" = true,
                                     "commit_tx"     = true
   // constraints
   constraints "memory"        apply memory @max="8gb"
   constraints "cpu"           apply cpu @shares=1024
   constraints "scheduling"    apply ha @scale=3
   // healthchecks
   monitoring "healthchecks"   apply tcp @port=8080,@timeout=2000,@interval=2,@action="RECREATE"
   // logs
   monitoring "logs" from console {
        tty = true,
        stdin_open = true
   }
   // network
   network "dns" "alias" table "alias-service-cassandra" = "cassandra",
                               "alias-service-solr"      = "solr-bly",
                               "alias-service-geo"       = "bly-geo"
   network "dns"         apply hostname @name="service-frontend"
   // metadata
   metadata "labels"     table  "io.rancher.container.hostname_override" = "container_name",
                                "io.rancher.container.pull_image"        = "always"
}