#!/bin/bash
# usage: pass.sh <J> <1|2> [sites...]   pass 1: even-index sites stealth, odd plain; pass 2 the other mode
J=$1; P=$2; shift 2
ALL=(g2 crunchbase upwork indeed zillow google reddit linkedin trustpilot glassdoor cf-test antibot ikea yellowpages apnews docsify gmaps)
mkdir -p $J/raw/walk
i=0
for s in "${ALL[@]}"; do
  if [ $(( (i + P) % 2 )) -eq 1 ]; then m=stealth; else m=plain; fi
  i=$((i+1))
  if [ $# -gt 0 ] && [[ ! " $* " =~ " $s " ]]; then continue; fi
  timeout 112 python3 -I $J/walk.py $J $s $m > $J/raw/walk/$s-$m.stdout 2>&1 &
done
wait
date >> $J/raw/walk/pass$P.done
