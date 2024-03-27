#!/usr/bin/env bash
hits=$1
target=$2

for (( i = 1; i <= $hits; i++ )); do
    echo "[$hits/$i] Target: $target"
    # response=$(curl -Lk $target)
    curl --head -Lk -s $target | grep HTTP
    # 
done