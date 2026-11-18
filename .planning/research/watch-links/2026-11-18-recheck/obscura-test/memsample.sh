#!/bin/bash
# usage: memsample.sh <J> <concurrency>  — runs scrape and samples summed RSS of the run's process tree
J=$1; C=$2; V=$J/raw/volume
obscura scrape $(cat $V/urls.txt) --concurrency $C -q > $V/memrun-c$C.json 2>/dev/null &
P=$!
peak=0; nproc=0
while kill -0 $P 2>/dev/null; do
  pids="$P $(pgrep -P $P | tr '\n' ' ')"
  s=0; n=0
  for p in $pids; do r=$(awk '/VmRSS/{print $2}' /proc/$p/status 2>/dev/null); [ -n "$r" ] && s=$((s+r)) && n=$((n+1)); done
  [ $s -gt $peak ] && peak=$s && nproc=$n
  sleep 0.2
done
echo "c=$C peak summed RSS ${peak} kB over $nproc processes"
