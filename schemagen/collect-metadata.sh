#!/bin/env /bin/bash

echo "{"
find $1/{processor,receiver,exporter} -name "metadata.yaml" -print0 |
    while IFS= read -r -d '' file; do
        COMPONENT=$(basename $(dirname $file))
        echo "  '$COMPONENT': std.parseYaml(importstr '$file'),"
    done
echo "}"
