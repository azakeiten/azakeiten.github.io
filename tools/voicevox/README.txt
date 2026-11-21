声のつくり方（VOICEVOX）

このサイトの声は、無料の音声合成ソフト VOICEVOX（https://voicevox.hiroshiba.jp/）で前もってつくった mp3 です。
  お札マン ……………… VOICEVOX:白上虎太郎（わーい・style id 32）
  ナレーション・案内 … VOICEVOX:冥鳴ひまり（ノーマル・style id 14）
クレジットは policy.html の「voice-credit」に書いてあります。キャラクターを変えたら、そこも直すこと。

どこにあるか
  voice/＊.mp3        案内のことば（「開始します」「正解です」など）。voice.js の say(['名前']) で呼ぶ。文は ann.tsv
  voice/vv/＊.mp3     1 文ごとの声。m-＝お札マン、n-＝ナレーション。名前は「文（字幕と同じ字）」の FNV-1a（36 進）
  voice/vv/list.json  ある声の一覧。voice.js がこれを見て、あれば mp3、なければブラウザの読み上げで読む

せりふを足したり変えたりしたとき（osatsu.js の豆知識、deck.js の CL・S[i].n）
  1. VOICEVOX ENGINE を起動（run.exe --port 50021）
  2. サイトのフォルダで
       perl tools/voicevox/vv-extract.pl > 作業/vv-src.json
       perl tools/voicevox/vv-plan.pl 作業/vv-src.json voice.js > 作業/vv-plan.json
     vv-plan.json の 3 番目が、VOICEVOX に渡す読み（voice.js の READ で、読みまちがえやすい言葉をひらがなにしたもの）
  3. vv-plan.json から「名前<TAB>読み」の vv.tsv をつくり、run.sh で wav をつくる（すでにある wav は飛ばす）
  4. tomp3.ps1 -InDir wav のフォルダ -OutDir voice/vv で mp3 に（Windows の mp3 エンコーダーを使う。64kbps・モノラル）
  5. voice/vv/list.json を、ある mp3 の名前で作りなおす。voice.js の VVV（と、案内を変えたら VER）を 1 つ上げる
変えた文の古い mp3 は、使われなくなるだけ（消してもよい）。
