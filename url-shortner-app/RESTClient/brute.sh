
target=$1
shift
for (( i = 1; i <= 100; i++ )); do
    echo "[$i] Target:$target"
    curl -s $@ -- $target
done