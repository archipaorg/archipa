take github.com/k8s-icl/latest/v1beta1/deployment,
     github.com/k8s-icl/latest/v1/containerport,
     github.com/k8s-icl/latest/v1/container

::variable "container-port" apply ContainerPort @@name="nginx", @@containerPort="8080"
::variable "container-ports" [variable.container-port]
::variable "container" apply Container @@image="nginx:1.13.0", @@name="nginx", @@ports=variable.container-ports
::variable "container-list" [variable.container]
::variable "pod-spec" apply PodSpec @@containers=variable.container-list
::variable "labels" table "app" = "nginx"
::variable "pod-metadata" apply ObjectMeta @@labels=variable.labels
::variable "template" apply PodTemplateSpec @@spec=variable.pod-spec, @@metadata=variable.pod-metadata
::variable "spec" apply DeploymentSpec @@replicas=5, @@template=variable.template
::variable "metadata" apply ObjectMeta @@name = "nginx"

_ "_" apply Deployment @@metadata=variable.metadata, @@spec=variable.spec

/*
// examples from https://github.com/kubernetes/kubernetes/blob/master/examples/storage/cassandra/cassandra-controller.yaml
https://cloud.google.com/container-engine/docs/tutorials/persistent-disk/
apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  name: nginx-deployment
spec:
  replicas: 2
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.7.9
        ports:
        - containerPort: 80
*/
