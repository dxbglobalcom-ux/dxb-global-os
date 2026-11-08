#!/bin/bash
# Fetch selected text files from a Hugging Face dataset repo into raw/video/hf__<owner>__<name>/.
# usage: fetch_hf.sh <dest_root> <owner/name> <file> [file ...]
dest="$1"; ds="$2"; shift 2
d="$dest/hf__${ds/\//__}"; mkdir -p "$d"
curl -s "https://huggingface.co/api/datasets/$ds" > "$d/.hf_api.json"
for f in "$@"; do
  mkdir -p "$d/$(dirname "$f")"
  curl -sfL "https://huggingface.co/datasets/$ds/resolve/main/$f" -o "$d/$f" || echo "FAIL $ds $f"
done
echo "$ds $(du -sh "$d" | cut -f1)"
