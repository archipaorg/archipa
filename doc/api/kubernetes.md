archipa-kubernetes(3)—compiles ICL files using k8s-icl template
====================================================
## SYNOPSIS
bootstrap.commands.kubernetes(path, imports, searchIn)
## DESCRIPTION
Compile the ICL file located in the specified path and returns the compilation output
which includes that AST, the generated JSON and all the aliases defined.

path:
The path must be a `String` and must be a file using a relative or absolute path.
The command returns a promise. The promise returns an Object. this object
contains the following fields :
**aliases** those are the list of aliases defined across the different ICL files
**ast** this is the global AST 
**output** this is the generated JSON object.
bootstrap-isonline(1)—check if a database is online