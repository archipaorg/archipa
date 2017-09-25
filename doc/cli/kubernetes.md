archipa-kubernetes(1)—compile ICL files using k8s-icl templates
====================================================
archipa kubernetes <path> [--view-ast, --imports = url1,url2, --searchIn = dir1, dir2...|--json|--yaml]
## DESCRIPTION
<path>:
Compile the ICL file located in the specified path and prints the generated YAML output.
JSON output is also supported by passing the `--json` flag.

--view-ast: 
Displays the generated AST and not the actual generated JSON/YAML output.

--imports:
This is a list of ICL files that needs to be included at compile time.

--searchIn:
Those are the directories that needs to be searched in for ICL dependencies