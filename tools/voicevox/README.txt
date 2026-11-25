声のつくり方（AivisSpeech ／ 前は VOICEVOX）

このサイトの声は、無料の音声合成ソフト AivisSpeech（https://aivis-project.com/）で前もってつくった mp3 です（2026.11.25 から）。
  お札マン ……………… AivisSpeech: らせつん（喜び）        AivisHub・こずかた学園プロジェクト・ACML 1.0
  ナレーション・案内 … AivisSpeech: みちのくあいり（標準）  AivisHub・こずかた学園プロジェクト・声：上戸恵里・ACML 1.0
クレジットは policy.html の「voice-credit」に書いてあります。声を変えたら、そこも直すこと。
ACML 1.0 では、モデルのキャラクター本人・公式の声とまちがえられる使い方や、人を傷つける使い方などは禁止。くわしくは https://github.com/Aivis-Project/ACML

どこにあるか
  voice/＊.mp3        案内のことば（「開始します」「正解です」など）。voice.js の say(['名前']) で呼ぶ。文は ann.tsv
  voice/vv/＊.mp3     1 文ごとの声。m-＝お札マン、n-＝ナレーション。名前は「文（字幕と同じ字）」の FNV-1a（36 進）
  voice/vv/list.json  ある声の一覧。voice.js がこれを見て、あれば mp3、なければブラウザの読み上げで読む

AivisSpeech の用意（このパソコンでは済み）
  ・AivisSpeech の zip 版（GitHub の Aivis-Project/AivisSpeech のリリース）を %LOCALAPPDATA%\azakei-aivis に展開
  ・声のモデル（.aivmx）は AivisHub のモデルのページからダウンロードし、%APPDATA%\AivisSpeech-Engine\Models に「モデルの UUID.aivmx」の名前で置く
  ・エンジンだけを起動：%LOCALAPPDATA%\azakei-aivis\AivisSpeech\AivisSpeech-Engine\run.exe --host 127.0.0.1 --port 10101
  ・スタイル番号は http://127.0.0.1:10101/speakers で確かめる（らせつん「喜び」＝893625025、みちのくあいり「標準」＝1717361472）
  ・このパソコン（ARM）では x64 のまねをして動くので、1 文に 20〜30 秒かかる。全部（約 180）で 1 時間ほど

せりふを足したり変えたりしたとき（osatsu.js の豆知識、deck.js の CL・S[i].n）
  1. AivisSpeech のエンジンを起動（上のとおり）
  2. サイトのフォルダで
       perl tools/voicevox/vv-extract.pl > 作業/vv-src.json
       perl tools/voicevox/vv-plan.pl 作業/vv-src.json voice.js > 作業/vv-plan.json
     vv-plan.json の 3 番目が、エンジンに渡す読み（voice.js の READ で、読みまちがえやすい言葉をひらがなにしたもの）
     年は「2024年」のように数字で書くこと（「二〇二四」は「に まる に よ」と読まれる）
  3. vv-plan.json から「名前<TAB>読み」の vv.tsv をつくり、run-aivis.sh で wav をつくる（すでにある wav は飛ばす）
       sh tools/voicevox/run-aivis.sh 作業
     案内のことばを変えたら、ann.tsv も作業フォルダに入れる。開演のカウントダウンは joinwav.pl で cd3・cd2・cd1・cd0 を 0.9 秒あけてつなぐ
  4. tomp3.ps1 -InDir wav のフォルダ -OutDir voice/vv で mp3 に（Windows の mp3 エンコーダーを使う。64kbps・モノラル。同じ名前の mp3 があると飛ばすので、作りなおすときは先に消す）
  5. voice/vv/list.json を、ある mp3 の名前で作りなおす。voice.js の VVV（と、案内を変えたら VER）を 1 つ上げる
変えた文の古い mp3 は、使われなくなるだけ（消してもよい）。

VOICEVOX にもどすとき
  run.sh（VOICEVOX ENGINE・port 50021・お札マン 白上虎太郎 32・ナレーション 冥鳴ひまり 14）と humanize.pl（抑揚・間・文の終わりを人の話し方に近づける）が残してある。
  クレジットは「VOICEVOX:白上虎太郎」「VOICEVOX:冥鳴ひまり」にもどすこと。
