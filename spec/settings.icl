settings "base_image" from image {
    monitoring "logs"       apply logs.console @stdin_open=true
    constraints "resources" apply resources.usage @cpu=1024,@mem=2048
    constraints "scheduling" apply rancher.scheduling @pullimage=true
}

settings "app_image" from base_image {
     network "dns" "alias" table  "alias-service-geo"             = app.service-geo
                                      "alias-service-solr"        = app.service-solr
                                      "alias-service-cassandra"   = app.service-cassandra
                                      "alias-service-measure"     = app.service-measure
}

settings "cassandra_image" from base_image "usman/docker-rancher-cassandra:3.1" {
    command = ["mkdir -p tmp-cassandra && curl -L -o tmp-cassandra/cassandra.tar.gz https://www.dropbox.com/s/n37s4z55k3whbzm/cassandra.tar.gz?dl=0 -O -J && tar -zxvf tmp-cassandra/cassandra.tar.gz -C tmp-cassandra >/dev/null && tmp-cassandra/cassandra/secure.sh  &! /docker-entrypoint.sh -f"]
    entrypoint = ["/bin/sh", "-c"]
    constraints "resources"     apply resources.volume @from="/var/lib/cassandra", @to="/var/lib/cassandra"
    configuration "environemnt" table "RANCHER_ENABLE"       = "true"
                                      "RANCHER_SEED_SERVICE" = "service-cassandra-seed"
                                      "CASSANDRA_RACK"       = "RACK-1"
                                      "CASSANDRA_DC"         = "ONLINE-AMS-1"
                                      "CASSANDRA_ENDPOINT_SNITCH" = "GossipingPropertyFileSnitch"
                                      "AUTHENTICATION_MODE" = "org.apache.cassandra.auth.PasswordAuthenticator"
                                      "AUTHORIZER"          = "org.apache.cassandra.auth.CassandraAuthorizer"
                                      "LOAD_SCRIPT_1_BLY"   = "bly.cql"
                                      "LOAD_SCRIPT_2_AUTH"  = "auth.cql"
                                      "ENABLE_CQL_SCRIPT"   = "false"
}


orch "scheduling" @pullimage {
    pullimage = @pullimage
}


core "app" {


} as app



app "name" {

}

app "name" from core.app {

}