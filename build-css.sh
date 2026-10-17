#!/bin/sh
# site.css（読みやすい元のファイル）から、コメントと余分な空白を取った site.min.css を作る。
# site.css を書きかえたら、このファイルを実行してください：  sh build-css.sh
perl -0777 -pe 's{/\*.*?\*/}{}gs; s/[ \t]*\n[ \t]*/\n/g; s/\n+/\n/g; s/[ \t]+/ /g; s/\s*([{};])\s*/$1/g; s/;}/}/g' site.css > site.min.css
echo "site.min.css: $(wc -c < site.min.css) bytes"
