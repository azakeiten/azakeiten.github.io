#!/bin/sh
# AivisSpeech で 1 行ずつ合成する（2026.11.25〜。すでにある wav は飛ばす）
#   sh run-aivis.sh 作業フォルダ   … 作業フォルダの vv.tsv（名前<TAB>読み）と ann.tsv から、vv/ と ann/ に wav をつくる
# エンジン：AivisSpeech-Engine（127.0.0.1:10101。VOICEVOX と同じ audio_query / synthesis の形）
#   お札マン（m-）……… らせつん「喜び」（AivisHub・こずかた学園プロジェクト・ACML 1.0）
#   ナレーション（n-）・案内 … みちのくあいり「標準」（AivisHub・こずかた学園プロジェクト・声：上戸恵里・ACML 1.0）
# スタイル番号はモデルを入れた PC で http://127.0.0.1:10101/speakers を見て確かめる
# 注意：日本語は perl で %XX にしてから URL に入れる（そのまま渡すと Windows で文字化けする）
#       年は「2024年」のように数字で書く（「二〇二四」と書くと「に まる に よ」と読まれる）
M_ID=${M_ID:-893625025}
N_ID=${N_ID:-1717361472}
cd "${1:-.}"
mkdir -p vv ann
enc() { printf '%s' "$1" | perl -pe 's/([^A-Za-z0-9_.~-])/sprintf("%%%02X", ord($1))/ge'; }
syn() {
  out=$1; id=$2; txt=$3
  [ -s "$out" ] && return
  curl -s -X POST "http://127.0.0.1:10101/audio_query?speaker=$id&text=$(enc "$txt")" -o q.json &&
  curl -s -X POST "http://127.0.0.1:10101/synthesis?speaker=$id" -H "Content-Type: application/json" --data-binary @q.json -o "$out.tmp" &&
  [ -s "$out.tmp" ] && mv "$out.tmp" "$out"
}
[ -f vv.tsv ] && while IFS="$(printf '\t')" read name txt; do case $name in m-*) id=$M_ID;; *) id=$N_ID;; esac; syn "vv/$name.wav" $id "$txt"; done < vv.tsv
[ -f ann.tsv ] && while IFS="$(printf '\t')" read name txt; do syn "ann/$name.wav" $N_ID "$txt"; done < ann.tsv
echo done $(ls vv | wc -l) $(ls ann | wc -l)
