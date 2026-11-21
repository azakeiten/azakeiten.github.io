#!/bin/sh
# VOICEVOX で 1 行ずつ合成（すでにある wav は飛ばす）
cd "${1:-.}"
syn(){ out=$1; id=$2; txt=$3; [ -s "$out" ] && return; curl -s -X POST -G "http://127.0.0.1:50021/audio_query" --data-urlencode "text=$txt" --data-urlencode "speaker=$id" -o q.json && curl -s -X POST "http://127.0.0.1:50021/synthesis?speaker=$id" -H "Content-Type: application/json" --data-binary @q.json -o "$out.tmp" && mv "$out.tmp" "$out"; }
while IFS="$(printf '\t')" read name txt; do case $name in m-*) id=32;; *) id=14;; esac; syn "vv/$name.wav" $id "$txt"; done < vv.tsv
while IFS="$(printf '\t')" read name txt; do syn "ann/$name.wav" 14 "$txt"; done < ann.tsv
echo done $(ls vv | wc -l) $(ls ann | wc -l)
