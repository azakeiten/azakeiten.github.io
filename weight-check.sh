#!/bin/sh
# weight-check.sh — ページの「重さ」の点検（公開の前に sh weight-check.sh）
#  ・各ページが最初に読みこむ HTML・CSS・JS を、実際に届く大きさ（gzip）で合計する
#  ・あとから読みこむもの（写真・あとで読むクイズの問題など）は数えない
#  ・予算（BUDGET_KB）をこえたページには「⚠ 重い」と出す
BUDGET_KB=${BUDGET_KB:-175}
cd "$(dirname "$0")"
css=$(gzip -c site.min.css | wc -c)
printf '%-18s %6s %6s %6s %7s\n' page html css js total
for p in *.html; do
  case $p in admin.html|offline.html|404.html|sponsor-kit.html) continue;; esac
  html=$(gzip -c "$p" | wc -c)
  js=0
  for s in $(grep -o '<script src="[a-z0-9-]*\.js' "$p" | sed 's/<script src="//'); do
    [ -f "$s" ] && js=$((js + $(gzip -c "$s" | wc -c)))
  done
  total=$(( (html + css + js) / 1024 ))
  mark=''; [ "$total" -gt "$BUDGET_KB" ] && mark='  ⚠ 重い'
  printf '%-18s %5dK %5dK %5dK %6dK%s\n' "$p" $((html/1024)) $((css/1024)) $((js/1024)) "$total" "$mark"
done
echo "予算: 1 ページ ${BUDGET_KB}KB まで（写真は別）"
