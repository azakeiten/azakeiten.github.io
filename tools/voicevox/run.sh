#!/bin/sh
# VOICEVOX で 1 行ずつ合成する（すでにある wav は飛ばす）
#   sh run.sh 作業フォルダ   … 作業フォルダの vv.tsv（名前<TAB>読み）と ann.tsv から、vv/ と ann/ に wav をつくる
# 注意：日本語をそのまま curl の引数に渡すと、Windows では文字化けして別の文として読まれる。
#       かならず perl で %XX にしてから、URL に入れる（2026.11.22 にこれで全部つくりなおした）
cd "${1:-.}"
mkdir -p vv ann
enc() { printf '%s' "$1" | perl -pe 's/([^A-Za-z0-9_.~-])/sprintf("%%%02X", ord($1))/ge'; }
syn() {
  out=$1; id=$2; txt=$3
  [ -s "$out" ] && return
  curl -s -X POST "http://127.0.0.1:50021/audio_query?speaker=$id&text=$(enc "$txt")" -o q.json &&
  curl -s -X POST "http://127.0.0.1:50021/synthesis?speaker=$id" -H "Content-Type: application/json" --data-binary @q.json -o "$out.tmp" &&
  mv "$out.tmp" "$out"
}
# m-＝お札マン（白上虎太郎・わーい 32）、n-＝ナレーション（冥鳴ひまり 14）、案内も冥鳴ひまり
[ -f vv.tsv ] && while IFS="$(printf '\t')" read name txt; do case $name in m-*) id=32;; *) id=14;; esac; syn "vv/$name.wav" $id "$txt"; done < vv.tsv
[ -f ann.tsv ] && while IFS="$(printf '\t')" read name txt; do syn "ann/$name.wav" 14 "$txt"; done < ann.tsv
echo done $(ls vv | wc -l) $(ls ann | wc -l)
