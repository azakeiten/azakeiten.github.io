#!/bin/sh
# site.css（読みやすい元のファイル）から、コメントと余分な空白を取った site.min.css を作る。
# site.css を書きかえたら、このファイルを実行してください：  sh build-css.sh
perl -0777 -pe 's{/\*.*?\*/}{}gs; s/[ \t]*\n[ \t]*/\n/g; s/\n+/\n/g; s/[ \t]+/ /g; s/\s*([{};])\s*/$1/g; s/;}/}/g' site.css > site.min.css
echo "site.min.css: $(wc -c < site.min.css) bytes"
# 1 ページだけで使うルールを p-〈ページ名〉.min.css に分ける（各ページが読むのは「共通」＋「自分の分」だけ）
perl split-css.pl
