echo "STARTING"

sudo perf record -p $1 -F 100 -g -- sleep 60 &
wrk -c20000 -t6 -d1m http://localhost:8080

for job in `jobs -p`
do
echo $job
  wait $job
done

sudo chown root /tmp/perf-$1.map
sudo perf script > out.nodestacks
./FlameGraph/stackcollapse-perf.pl < out.nodestacks | ./FlameGraph/flamegraph.pl > out.nodestacks.$1.svg

echo "ALL DONE!"