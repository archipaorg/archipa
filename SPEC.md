# Specification


## Notice 
This is an early draft for public review

## Overview 
This document defines the common bricks of any cloud native application.

Developers can express their application infrastructure as a code using the concepts described in this specification and use a tool like archipa-cli to get the appropriate YAML configuration file based on the orchestrator they are using. Hence everyone will be able share its app stack no matter what everyone's orchestrator is.

Here is an example of what it would be like to describe it's application infrastructure using archipa ICL templates :

	App "service-frontend" from image @"docker_repo/helloworld:1.0.0" {

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
	                               "alias-service-solr"      = "solr"
	   network "dns" apply hostname @name="service-frontend"
	   // metadata
	   metadata "labels"  table  "stack" = "front",
	                             "container.pull_image" = "always"
	}

## Compute 

Here we define an application or a job as a piece of software that is running in a container, this piece is managed by the developer own infrastructure.

The software run in this container can originate from a source control (github, bitbucket...) or simply from a Docker repository.

### Task
Contains the basic elements that every piece of software needs such as cpu, memory, storage.
	
	take memory, cpu, volume

	::bricks "core" "task" from constraints.memory, 
							    constraints.cpu, 
							    constraints.volume {
	    // task description e.g. website frontend...
	    description  = "",
	    // indicate the type of the task app:web, app:mail, job:worker ...
	    type  = "generic"
	}

### App
				
	::bricks "compute" "app" as App from bricks.core.task {
	    // type of the app, default to web
	    type = "web" 
	}
	
### Job
	
	::bricks "compute" "job" as Job from bricks.core.task {
    		// type of the app, default to job
    		type = "job"
	} 

## Monitoring 
 
### HealthChecks

#### TCP
	::bricks "monitoring" "healthchecks" "tcp" as Tcp
	                                                @port,
	                                                @timeout,
	                                                @interval,
	                                                @action {
	
	    type        = "tcp",
	    port        = @port,
	    timeout     = @timeout,
	    interval    = @interval,
	    action      = @action
	}
 	
### Logs

#### Console
	::bricks "monitoring" "logs" "console" as Console {
	    tty = "",
	    stdin_open = ""
	}

## Network 

### DNS 

### Hostname :

### LB
Every App/Job contact another service through an LB, this can be a local LB provided by the orchestrator for example or an external one (ELB)

## Constraints	
Containers are better managed by putting constraints on them

### CPU 

	/**
	   CPU Constraints
	   @see https://docs.docker.com/engine/reference/run/#runtime-constraints-on-resources
	*/
	::bricks "core" "cpu" as Cpu
	           /**
	            CPU shares (relative weight)
	            Remember that soft cpu usage limit only applied when there are constraints on the running environment
	            In docker this parameter is called --cpu-shares, default value = 0
	           */
	           @shares,
	           /**
	             Number of CPUs. Number is a fractional number. 0.000 means no limit.
	             In docker this parameter is called "--cpus"
	           */
	           @reserved,
	           /**
	            Limit the CPU CFS (Completely Fair Scheduler) period
	            In docker this parameter is called "--cpu-period", default value = 0
	           */
	           @period,
	           /**
	            CPUs in which to allow execution (0-3, 0,1)
	            In docker this parameter is called "--cpuset-cpus"
	           */
	           @affinity,
	           /**
	            Limit the CPU CFS (Completely Fair Scheduler) quota
	            In docker this parameter is called "--cpu-quota", default value = 0
	           */
	           @quota {
	
	    shares      = @shares,
	    reserved    = @reserved,
	    period      = @period,
	    affinity    = @affinity,
	    quota       = @quota
	
	}

### Memory 

	/**
	    Memory Constraints
	    @see https://docs.docker.com/engine/reference/run/#specify-custom-cgroups
	    @see http://elixir.free-electrons.com/linux/latest/source/Documentation/cgroup-v1/memory.txt
	*/
	::bricks "core" "memory" as Memory
	              /**
	                Memory limit (format: <number>[<unit>]). Number is a positive integer. Unit can be one of b, k, m, or g.
	                Minimum is 4M.
	                In docker this parameter is equivalent to "--memory"
	              */
	              @max,
	              /**
	               Total memory limit (memory + swap, format: <number>[<unit>]). Number is a positive integer.
	               Unit can be one of b, k, m, or g.
	               In docker this parameter is equivalent to "--memory-swap"
	              */
	              @swap,
	              /**
	               Soft limits allow for greater sharing of memory. The idea behind soft limits
	               is to allow control groups to use as much of the memory as needed, provided
	               In docker this parameter is equivalent to "--memory-reservation"
	              */
	              @reserved {
	
	    max         = @max,
	    swap        = @swap,
	    reserved    = @reserved
	
}

### Volume

	/**
	   Volume Constraints
	   @see https://docs.docker.com/engine/reference/run/#volume-shared-filesystems
	*/
	
	::bricks "core" "volume" as Volume /**
	                bind volume from to a location
	                In docker @from + @to settings are equivalent to "--volume=[host-src:]container-dest[:<options>]"
	                If only from setting is specified then it's equivalent to "--volumes-from"
	                to mount all volumes from the given container(s)
	               */
	              @from,
	              @to,
	              @driver {
	
	    volume_from = @from,
	    volume_to   = @to
	
	}

### Scheduling 

#### Scale
	::bricks "scheduling" "scale" as Ha @scale {
	    scale = @scale
	}

#### Physical application affinity
Controls how the orchestrator should schedule a container on a physical or logical location.

#### Time

#### Replicas 
AutoScale, Regions and Availability Zones	
 
## Metadata
Those are key value pairs that will be associated with the container

## Secrets 
### Environment variable 
### Mounted secrets	
	
## Storage

### Git

	::bricks "storage" "git" as Git {
	    url = "@url" // git repository url
	}

### Image

	::bricks "storage" "image" as Image {
	    url = "@url" // docker image repo url
	}
  	
## Third Party apps
An add-on is a piece of software that is provided and managed by a third party. 
         
## SPACES
Spaces is a way to group a set of application into the same "namespace" so to speak

   SELECTORS 
        -> APP 1, APP2 ...
    
 Example of usage :
 
	space "front" {
	    description = "All the front stack"
	    apps = [app.website, app.staticFileServer]
	}  
