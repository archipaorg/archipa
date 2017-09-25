 
# Archipa

## Goal 
One of the biggest issues that Docker has resolved is without any doubt portability, Docker made our apps easily portable, in fact thanks to docker containers everyone can now build, ship and run it's app anywhere. However when Docker containers became popular we realized that we needed an automated way to manage those containers inside a Docker cluster and that's why tools such as Docker Swarm, Kubernetes, Rancher... were developed, container orchestrators made our life easier and help us manage our services so easily that we even forget sometimes the containers behind the scene. The problem is that when you describe your service in a YAML file, this configuration file is tied to the orchestrator that you are using so even if everyone is using the same technology under the hood, we don't have a common language that enables everyone to describe it's application infrastructure independently from any physical resources and/or orchestrator thus depriving the community from sharing common stacks that can be enhanced and used by everyone. 

Archipa aims to resolve this problem by proposing a clear and elegant way to describe it's application infrastructure as a code and like any good programming language enforce you by default to enforce the common best practices (12 factor apps, separation of concerns...) into your application architecture.

## Plan
We are strong believers in the power of a community, this is why this project is very open to everyone for contributions, this repository is as a place where we can gather around, discuss and figure out how to achieve what we need to do.

As a start we defined a list of steps/tasks that (we think) needs to be achieved in order to reach our goal

* ==**Configuration Lanaguage** : Develop a configuration language that is easy to read, self documented and can be compiled to JSON/YAML easily. This language will be used to create easy to use and readable templates.== **=> Done** [ICL language](https://github.com/archipaorg/icl) is born. 
* **Templates Generation** : For every major orchestrator (Kubernetes, Rancher...), we need to generate their configuration templates written in ICL, based on their JSON schemas.
			==* We have created a little program that generates k8s icl templates from k8s JSON schemas, this is available at [https://github.com/archipaorg/k8s-icl]()==

* **App Infrastructure As a Code** : Define a set of bricks that are common to every cloud native app. 
		Specification draft available at https://github.com/archipaorg/archipa/spec.md
		
* **JSON Mapping** : Write the appropriate JSON mappings that will transpile any application infrastructure as code written in ICL to a specific orchestrator file format in YAML.


## Current Project Status
For the moment, archipa can be used to compile your ICL files into JSON/YAML files using the appropriate templates based on the orchestrator/version you are using.

* For k8s templates, take a look at  [https://github.com/archipaorg/k8s-icl]()
* More orchestrators templates are coming.

Otherwise we are still working on the specification that everyone could use once finished to express (if he wants to) his application infrastructure independently from the orchestrator he's using.

## Install

	npm install -g @archipaorg/archipa

## Usage 

	archipa <orchestrator> --json|--yaml 
	
**Example :**
If i want to compile my ICL files against Kubernetes 
	
	archipa kubernetes --yaml service.icl
	
Archipa will automatically download the necessary k8s-icl templates and use them for compilation.

## Contributions
We love contributions! There's lots to do, so why not chat with us about what you're interested in doing? Please join the #archipa channel on our Slack and let us know about your plans.

Documentation, bug reports, pull requests, and all other contributions are welcome!

To suggest a feature or report a bug: https://github.com/archipaorg/archipa/issues   
