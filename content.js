/* ================================================================
   content.js — サイト全体のデータ
   ここを書き換えるだけで、イベント・写真・日常・実績などが更新されます。
   ================================================================ */
window.AZAKEI = {

  /* ---- サイトの最終更新日（フッターに出す。更新したら書きかえる） ---- */
  siteUpdated: '2026-11-26',

  /* ---- トップ「新しく、遊べるもの」（新しい順。date はその遊びを公開した日） ---- */
  newPlay: [
    { date: '2026-11-26', seal: '訳', tone: 'shu', href: 'sim.html#uchiwake', eyebrow: '経済ラボ', title: 'おにぎり屋の値上げ会議', text: 'お米も電気代も値上がり。値上げ？ 小さくする？ 工夫する？ 社長として 6 か月を乗りきろう。' },
    { date: '2026-11-26', seal: '図', tone: 'paper', href: 'sim.html#gurafu', eyebrow: '経済ラボ', title: '見出しチェック 40 秒', text: '「A 社の 3 倍に！」その見出し、グラフの数字と合ってる？ 新聞のデスクになってチェック。' },
    { date: '2026-11-26', seal: '旅', tone: 'dark', href: 'sim.html#asagohan', eyebrow: '経済ラボ', title: '朝ごはん港の荷受け', text: 'トーストの小麦は、どの国から？ 地図の国を押して、材料の輸入先を当てよう。' },
    { date: '2026-11-26', seal: '辞', tone: 'green', href: 'glossary.html', eyebrow: '用語辞典', title: '辞典が 312 語に', text: '期待値、担保、実質賃金、マイニング、ハッシュ……。ゲームに出てくる 12 の言葉を足しました。' },
    { date: '2026-11-26', seal: '分', tone: 'gold', href: 'sim.html#bungyo', eyebrow: '経済ラボ', title: '文化祭の分担パズル', text: '1 人 6 時間。だれに、どの仕事を、何時間？ 何でも速い人に全部まかせるのが正解とは限らない、4 ステージのパズル。' },
    { date: '2026-11-25', seal: '昇', tone: 'dark', href: 'sim.html#infl', eyebrow: '経済ラボ', title: '実質ジャッジ 40 秒', text: '給料 +3%・物価 +5%。買えるものは、ふえた？ へった？ タイムマシンで 1 年ずつ進みながら、40 秒で判定するスピード勝負。' },
    { date: '2026-11-25', seal: '値', tone: 'paper', href: 'sim.html#market', eyebrow: '経済ラボ', title: '需要と供給ニュースデスク', text: '台風でキャベツは？ テレビで紹介されたパンは？ ニュースを読んで、需要と供給のどちらの線が動くかを当てよう。' },
    { date: '2026-11-24', seal: '店', tone: 'shu', href: 'sim.html#shop', eyebrow: '経済ラボ', title: '模擬店の当日 3 時間', text: 'メニュー・作る数・値段を決めて、文化祭の当日へ。「損益分岐点まで あと ◯ 個」をゼロにできるか。' },
    { date: '2026-11-24', seal: '為', tone: 'dark', href: 'sim.html#fx', eyebrow: '経済ラボ', title: '為替ニュース速報 40 秒', text: '1 ドル 135 円 → 145 円。輸出する会社は？ 留学生は？ うれしいか、こまるかを 40 秒で答えるスピード勝負。' },
    { date: '2026-11-24', seal: '株', tone: 'gold', href: 'sim.html#kabu', eyebrow: '経済ラボ', title: 'クレープ会社の社長 5 年', text: '株を売って集める？ 銀行から借りる？ 配当は？ 持ち分が半分を切ると、株主総会で社長交代も。' },
    { date: '2026-11-24', seal: '銀', tone: 'dark', href: 'sim.html#ginko', eyebrow: '経済ラボ', title: 'まちの銀行 6 年', text: '銀行の店長になって、だれに貸すかを決める経営ゲーム。利子が高い相手ほど、返せない心配も。金庫の現金がへりすぎると……。' },
    { date: '2026-11-24', seal: '税', tone: 'shu', href: 'sim.html#receipt', eyebrow: '経済ラボ', title: '税率レジ 45 秒', text: 'イートインのおにぎり、ノンアルコールビール、映画館のポップコーン。8% か 10% か、45 秒で打ち分けるレジ係のスピード勝負。' },
    { date: '2026-11-23', seal: '暗', tone: 'dark', href: 'sim.html#crypto', eyebrow: '経済ラボ', title: '暗号資産とブロックチェーン', text: 'ビットコインの台帳を書きかえると、どうなる？ ブロックを掘り直しても、みんなで持つ台帳には勝てない。お札・電子マネーとのちがいも仕分けます。' },
    { date: '2026-11-23', seal: '予', tone: 'paper', href: 'sim.html#budget', eyebrow: '経済ラボ', title: '100 円の予算会議', text: '5 円玉 20 枚で国の予算の使いみちを予想して、本物とくらべます。そのあと予算会議へ。足りない 2 円は、へらす・借りる・税のどこから出す？' },
    { date: '2026-11-22', seal: '億', tone: 'dark', href: 'sim.html#oku', eyebrow: '経済ラボ', title: '大きなお金のものさし', text: '1 兆円の重さは？ 国の予算を積むと？ 10 倍ごとの目もりのものさしで、ケタを当てるテスト。' },
    { date: '2026-11-22', seal: '籤', tone: 'gold', href: 'sim.html#kuji', eyebrow: '経済ラボ', title: '文化祭のくじ屋の店主に', text: '値段と当たりの本数を決めて、100 枚の箱を 3 回売ります。当たりを減らしすぎると、評判が落ちてお客さんが来なくなる。' },
    { date: '2026-11-22', seal: '倍', tone: 'paper', href: 'sim.html#double', eyebrow: '経済ラボ', title: '複利の時計：72 の法則の早解き', text: '1 問 12 秒。「72 ÷ 年利」で、お金や物価や借金が 2 倍になる年を当てる 8 問勝負。' },
    { date: '2026-11-22', seal: '試', tone: 'dark', href: 'sim.html', eyebrow: '経済ラボ', title: '経済ラボが「実験きっぷ」に', text: '29 の実験を説明つきのカードで一覧に。「はじめる」で 1 つずつ開いて、すぐ試せます。' },
    { date: '2026-11-22', seal: '字', tone: 'dark', href: 'quiz.html#crossword', eyebrow: 'あそび場', title: 'クロスワードが、毎日ちがう盤に', text: '約 50 語の経済のことばから、遊ぶたびに新しい盤を組み立てます。「今日の問題」は、同じ日ならだれでも同じ盤。' },
    { date: '2026-11-21', seal: '作', tone: 'paper', href: 'quiz.html#make', eyebrow: 'あそび場', title: 'クイズ工房：つくって友だちに出す', text: '最大 5 問のクイズ集をつくると、お札マンが問題のよさを星でチェック。リンクにして友だちに出せます。' },
    { date: '2026-11-21', seal: '絵', tone: 'gold', href: 'quiz.html#ehon', eyebrow: 'あそび場', title: '絵本が、えらんで分かれる読み聞かせに', text: '千円札を町のパン屋さん・ネットのお店・銀行のどこへ？ えらぶとお話が分かれ、通ったところがスタンプに。お札マンが声で読みます。' },
    { date: '2026-11-21', seal: '支', tone: 'green', href: 'quiz.html#nenkin', eyebrow: 'あそび場', title: '胴上げから肩車へが、年金の村 100 年に', text: '村長になって、10 年ごとに政策をえらぶ。子育て支援・長く働ける職場・年金を下げる・積み立て。2065 年まで両方の世代のくらしを守れるか。' },
    { date: '2026-11-21', seal: '貨', tone: 'gold', href: 'quiz.html#coins', eyebrow: 'あそび場', title: '世界のお金図鑑が、両替の世界一周に', text: '空港でお金の名前を当ててコインを集め、お土産の値段を日本円で見積もる。最後は円高・円安のクイズ。' },
    { date: '2026-11-21', seal: '進', tone: 'dark', href: 'quiz.html#shinka', eyebrow: 'あそび場', title: 'お金の進化が、困りごと解決ゲームに', text: '5 つの時代の困りごとを解決すると、お金が次の形へ変身。最後は 6 つのお金を古い順にならべる年表ならべ。' },
    { date: '2026-11-21', seal: '換', tone: 'green', href: 'quiz.html#koukan', eyebrow: 'あそび場', title: '交換の島が、6 日間のゲームに', text: '魚は 2 日でいたみ、動けるのは 1 日 4 回。物々交換と貝のお金で、本・布・薪をそろえる日数をくらべる。' },
    { date: '2026-11-21', seal: '札', tone: 'gold', href: 'quiz.html#cardgame', eyebrow: 'あそび場', title: 'カード勝負に、確率・取材・倍率', text: 'ニュースの予報に確率。チップ 1 枚で取材して読みなおし、カードの期待値を考えて ×1〜×3 で賭ける。相手には性格も。' },
    { date: '2026-11-21', seal: '双', tone: 'dark', href: 'quiz.html#sugoroku', eyebrow: 'あそび場', title: '経済すごろくが、作戦ゲームに', text: '財布・貯金・投資の 3 つの置き場所。景気予報を読んでお金を動かし、2 つのサイコロのどちらで進むかをえらぶ。もうけ話には要注意。' },
    { date: '2026-11-21', seal: '段', tone: 'green', href: 'quiz.html#zeidan', eyebrow: 'あそび場', title: '税の階段に「手取りはいくら増える？」', text: '8 人の昇給を見て、手取りの増え方を 15 秒で当てる 8 問勝負。答えるたびに、階段がその昇給の分だけ動いて答え合わせ。' },
    { date: '2026-11-20', seal: '釣', tone: 'gold', href: 'quiz.html#otsuri', eyebrow: 'あそび場', title: 'おつりの達人が、レジの 90 秒に', text: '列にならぶお客さん、待てる時間、レジの中の小銭の残り。朝・昼・夕方と忙しくなるレジで、おつりをわたしきれるか。最後はレジ締め。' },
    { date: '2026-11-20', seal: '遊', tone: 'dark', href: 'quiz.html', eyebrow: 'あそび場', title: '遊びを説明つきのカードで', text: '26 の遊びを、内容・時間・学べることつきのカードに。「はじめる」で、その遊びだけが開きます。' },
    { date: '2026-11-20', seal: '経', tone: 'light', href: 'quiz.html#kyuyo', eyebrow: 'あそび場', title: '経理の仕事：明細を完成させよう', text: '会社の経理係になって、3 人分の給料明細を計算。保険料と税金のひっかけに気をつけて。' },
    { date: '2026-11-20', seal: '月', tone: 'light', href: 'quiz.html#subsc', eyebrow: 'あそび場', title: 'サブスクで 1 年、やりくりゲーム', text: '読み放題に入る？ やめる？ 何冊買う？ 毎月めくれるできごとカードを見て、おこづかい 2,000 円で 1 年をやりくり。' },
    { date: '2026-11-20', seal: '捕', tone: 'dark', href: 'sim.html#chiiki', eyebrow: '経済ラボ', title: 'お金をつかまえろ', text: '町の外へ逃げるコインを、押してつかまえて町へもどす。めぐるほど売上が何倍にも。切り札は地域通貨。' },
    { date: '2026-11-20', seal: '価', tone: 'light', href: 'quiz.html#jika', eyebrow: 'あそび場', title: 'チケットの値段は時価：ライブ営業', text: 'お客さんの列が本当に門へ歩いてくる。値段を ＋／− でその場で動かして、1 週間の売上をねらおう。' },
    { date: '2026-11-20', seal: '上', tone: 'dark', href: 'quiz.html#nefuda', eyebrow: 'あそび場・経済ラボ', title: '「上級編」と「ミッション」', text: '値札のマジックとグラフのうそに、もっと見えにくいしかけの上級編。関税のシーソーには、ちょうどの関税をさがす 3 つのミッション。' },
    { date: '2026-11-19', seal: '麦', tone: 'dark', href: 'quiz.html#bakery', eyebrow: 'あそび場', title: '麻経ベーカリー 12 か月', text: '本格経営ゲーム。値段・焼く数・人・広告・新メニュー・借り入れを毎月決めて、パン屋を 1 年守りぬく。毎月の損益計算書つき、3 つのむずかしさ。' },
    { date: '2026-11-19', seal: '線', tone: 'dark', href: 'rosen.html', eyebrow: '新しいページ', title: '経済の路線図', text: '経済ラボ・あそび場・コンテストの体験を、5 つの路線の駅に。線の上を電車が走り、ためした駅には「済」。駅を押すと、きっぷが出ます。' },
    { date: '2026-11-19', seal: '訳', tone: 'light', href: 'sim.html#uchiwake', eyebrow: '経済ラボ', title: 'おにぎり 1 個の値段の中身', text: '140 円は、お米・運ぶ・お店・税金……だれのところへ？ 10 円玉 14 枚を配って予想し、おにぎりが中身の色でぬられる答え合わせ。' },
    { date: '2026-11-19', seal: '給', tone: 'dark', href: 'quiz.html#kyuyo', eyebrow: 'あそび場', title: 'はじめての給料明細', text: '給料が上がったのに、2 年目に手取りが減る？ プリンターから出てくる明細で、額面と手取り、引かれるお金の行き先を見ます。' },
    { date: '2026-11-19', seal: '機', tone: 'dark', href: 'sim.html#robot', eyebrow: '経済ラボ', title: 'ロボットがやってきた工場', text: '20 人のパン工場に機械がやってくる。パンの値段、売れる数、働く人の仕事は 5 年でどう変わる？ 学び直しの大切さを見ます。' },
    { date: '2026-11-19', seal: 'レ', tone: 'light', href: 'quiz.html#cashless', eyebrow: 'あそび場', title: '店長のレジ', text: 'お弁当屋さんの店長として、現金・カード・QR コードのどれを受け付ける？ 100 人のお客さん、手数料、今日入るお金とあとで入るお金をくらべます。' },
    { date: '2026-11-19', seal: '図', tone: 'light', href: 'sim.html#gurafu', eyebrow: '経済ラボ', title: 'グラフのうそを見破れ', text: '縦軸の切りとり、期間の切りとり、絵の大きさ、割合のわな、平均のわな。ニュースのグラフの 5 つのしかけを見破って、正しく描きなおします。' },
    { date: '2026-11-19', seal: '巡', tone: 'dark', href: 'sim.html#chiiki', eyebrow: '経済ラボ', title: 'めぐる町のお金', text: '町で使った 1 万円が、お店からお店へめぐって何倍の売上に？ 町の外へぬけるお金と、地域通貨のしくみを見ます。' },
    { date: '2026-11-19', seal: '札', tone: 'light', href: 'quiz.html#nefuda', eyebrow: 'あそび場', title: '値札のマジック', text: '半額・送料無料・残りわずか・ポイント還元。お店の値札にかくれた 7 つのしかけを、虫めがねで見破ります。' },
    { date: '2026-11-19', seal: '関', tone: 'dark', href: 'quiz.html#kanzei', eyebrow: 'あそび場', title: '関税のシーソー', text: '外国のトマトに関税をかけると、農家・政府・消費者はどうなる？ トラック・シーソー・需要と供給の図で、得する人と損する人を見くらべます。' },
    { date: '2026-11-19', seal: '価', tone: 'light', href: 'quiz.html#jika', eyebrow: 'あそび場', title: 'チケットの値段は時価', text: '遊園地の支配人になって 1 週間営業。毎日同じ値段か、曜日で変えるか。満員と空席、売上とお客さんの声をくらべます。' },
    { date: '2026-11-18', seal: '月', tone: 'dark', href: 'quiz.html#subsc', eyebrow: 'あそび場', title: 'サブスクと買い切り', text: '漫画・音楽・動画を、1 つずつ買うか、月ぎめの使い放題か。1 年をすすめてくらべる。解約忘れにも注意。' },
    { date: '2026-11-18', seal: '募', tone: 'shu', href: 'contests.html#cfund', eyebrow: 'コンテスト', title: 'クラウドファンディングに挑戦', text: '目標金額とお礼の値段を決めて、30 日間の募集。目標にとどかないと 1 円も受けとれない。' },
    { date: '2026-11-18', seal: '秘', tone: 'gold', href: 'quiz.html#himitsu', eyebrow: 'あそび場', title: '新しいお札のひみつ', text: 'かたむける、光にすかす、虫めがねで見る、さわる。新しいお札の、にせものを防ぐ 6 つのくふうをさがす。' },
    { date: '2026-11-18', seal: '園', tone: 'green', href: 'quiz.html#koen', eyebrow: 'あそび場', title: 'みんなの公園', text: 'みんなでコインを出し合って公園を育てる。出さない人も同じだけ受けとれたら？ 公共財とただ乗りの体験。' },
    { date: '2026-11-18', seal: '島', tone: 'green', href: 'contests.html#shimagdp', eyebrow: 'コンテスト', title: '島の GDP', text: '麦の農家・パン屋さん・家族の小さな島。お金がめぐると、生産・所得・支出の 3 つのメーターが同じになる。' },
    { date: '2026-11-18', seal: '浜', tone: 'gold', href: 'contests.html#hama', eyebrow: 'コンテスト', title: '浜辺のアイス屋さん', text: '浜辺でただ 1 つのお店なら、いくらにする？ となりにライバルが来たら？ 独占と競争で値段とお客さんが変わる。' },
    { date: '2026-11-18', seal: '川', tone: 'green', href: 'quiz.html#kawa', eyebrow: 'あそび場', title: '川上の工場', text: '工場がつくるほど川がよごれ、漁師さんの魚が減る。社会全体がいちばんよくなる環境税をさがす。' },
    { date: '2026-11-18', seal: '待', tone: 'dark', href: 'quiz.html#imaato', eyebrow: 'あそび場', title: 'いま？ それとも あとで？', text: 'いまもらうか、あとで少し多くもらうか。8 回えらぶと、どれくらいふえるなら待てるかがわかる。' },
    { date: '2026-11-18', seal: '繋', tone: 'dark', href: 'contests.html#hirogari', eyebrow: 'コンテスト', title: 'アプリが広がるとき', text: '70 人の町で、新しいアプリを 5 人に配る。友だちが使うと自分も使う。だれに配ると町じゅうに広がる？' },
    { date: '2026-11-17', seal: '段', tone: 'green', href: 'quiz.html#zeidan', eyebrow: 'あそび場', title: '税の階段', text: '所得税の 7 段の税率。段が上がっても、高い税率がかかるのはこえた部分だけ。コインをためてたしかめる。' },
    { date: '2026-11-17', seal: '檸', tone: 'gold', href: 'quiz.html#lemon', eyebrow: 'あそび場', title: 'フリマのなぞ', text: '見た目そっくりの中古スマホ。値段を下げると、なぜか良品のお店から閉まっていく。情報の非対称性の体験。' },
    { date: '2026-11-17', seal: '星', tone: 'dark', href: 'glossary.html#seiza', eyebrow: '用語辞典', title: 'ことばの星座', text: '300 語が夜空の星に。説明の中で出てくる言葉どうしを線で結び、押すと星座のように光る。' },
    { date: '2026-11-17', seal: '支', tone: 'paper', href: 'quiz.html#nenkin', eyebrow: 'あそび場', title: '胴上げから肩車へ', text: '65 歳以上の 1 人を、働く世代の何人で支える？ 1965 年・2012 年・2050 年で、人形の組み方が変わる。' },
    { date: '2026-11-17', seal: '燭', tone: 'dark', href: 'contests.html#rousoku', eyebrow: 'コンテスト', title: 'ローソク足をつくろう', text: '1 日の株価の線のとなりで、ローソク足が育っていく。始値・高値・安値・終値。5 日分そろったらクイズ。' },
    { date: '2026-11-17', seal: '払', tone: 'shu', href: 'quiz.html#atobarai', eyebrow: 'あそび場', title: '10 万円のゲーム機、どう払う？', text: '1 回払い・分割・リボ払い・ためてから買う。1 か月ずつ進めて、払った合計と月数をくらべる。' },
    { date: '2026-11-17', seal: '町', tone: 'dark', href: 'mypage.html#machi', eyebrow: 'わたしの記録', title: '麻経の町', text: 'サイトの 6 つの場所が夕ぐれの町に。遊んだぶんだけ窓に明かりがともり、ぜんぶともると屋根に「済」の旗。' },
    { date: '2026-11-17', seal: '池', tone: 'green', href: 'sim.html#ike', eyebrow: '経済ラボ', title: 'みんなの池', text: '1 つの池で 4 人が 10 年、魚をとる。とりすぎると池は空っぽに。漁獲枠のルールを入れるとどうなる？' },
    { date: '2026-11-17', seal: '算', tone: 'paper', href: 'contests.html#kessan', eyebrow: 'コンテスト', title: 'パン屋さんの決算発表', text: '値段・新商品・広告・人と機械を決めて 1 年営業。売上から利益までの滝グラフで、黒字か赤字かを発表。' },
    { date: '2026-11-17', seal: '模', tone: 'green', href: 'festival.html#room', eyebrow: '文化祭', title: '会場の 3D 模型が進化', text: '人形が順路を歩き、カメラがついていく。真上からの間取り図、会場の写真、にぎわいのようすも。' },
    { date: '2026-11-16', seal: '舵', tone: 'dark', href: 'sim.html#kinri', eyebrow: '経済ラボ', title: '景気の舵とり', text: '日本銀行の会議のメンバーになって、3 か月ごとに政策金利を決める。物価 2% と町の景気を、3 年間守れるかな。' },
    { date: '2026-11-16', seal: '散', tone: 'green', href: 'contests.html#bunsan', eyebrow: 'コンテスト', title: 'ポートフォリオの 10 年', text: 'チップ 100 枚を 6 つの会社に分けて、猛暑や長雨や不景気の 10 年を進める。分けると、ゆれはどう変わる？' },
    { date: '2026-11-16', seal: '競', tone: 'dark', href: 'sim.html#seri', eyebrow: '経済ラボ', title: 'せりの会場', text: 'マグロやメロンを、4 人の仲買人と札を上げて競りあう。せり上げ式と封筒式。値段はだれが決める？' },
    { date: '2026-11-16', seal: '備', tone: 'paper', href: 'sim.html#hoken', eyebrow: '経済ラボ', title: 'みんなで備える箱', text: 'まちのみんなで掛け金を出し合い、こまった家へ箱からお金が届く。10 年間、箱は足りるかな。保険のしくみの実験。' },
    { date: '2026-11-16', seal: '旅', tone: 'dark', href: 'sim.html#asagohan', eyebrow: '経済ラボ', title: '朝ごはんの世界旅行', text: 'お盆に朝ごはんをのせると、材料のおもな輸入先から日本へ、地図の上を船が進む。旅したきょりの合計も。' },
    { date: '2026-11-16', seal: '装', tone: 'gold', href: 'azakei.html#kisekae', eyebrow: 'AZAKEI', title: 'お札マンの着せかえ', text: '王冠・学生帽・はちまき、にっこり・ウインク、旗・そろばん、紅白の幕・夜空。組み合わせて、画像で保存できる。' },
    { date: '2026-11-16', seal: '演', tone: 'shu', href: 'contests.html#pitch', eyebrow: 'コンテスト', title: 'ピッチの舞台', text: '幕が上がると、書いたプランが原稿に。60 秒の発表のあと、3 人の審査員から質問。最後に審査員がアドバイスの札をあげる。' },
    { date: '2026-11-16', seal: '巡', tone: 'green', href: 'sim.html#pazuru', eyebrow: '経済ラボ', title: 'お金のめぐりパズル', text: '家計・企業・銀行・政府のあいだの 6 本の矢印に、給料・代金・預金・貸し出し・税金・公共サービスの札をはめる。ぜんぶ合うとお金が流れだす。' },
    { date: '2026-11-16', seal: '絵', tone: 'gold', href: 'quiz.html#ehon', eyebrow: 'クイズ', title: '絵本「お札マンと千円札の旅」', text: '1 枚の千円札が、給料・買い物・お店・銀行・税金・学校や道路へ。8 ページの絵本で、お金のめぐりを。声で読む・自動でめくるも。' },
    { date: '2026-11-16', seal: '証', tone: 'shu', href: 'mypage.html#shuryo', eyebrow: 'わたしの記録', title: '麻経の修了証', text: '親しむ・知る・つくるの 3 つの段の遊びをすると、それぞれに判。3 つそろうと修了証が出て、なまえを書いて印刷できます。' },
    { date: '2026-11-16', seal: '配', tone: 'paper', href: 'index.html#deck', eyebrow: '紹介', title: '紹介スライドの資料を印刷', text: 'スライドの「資料」で、13 枚の見出しと説明を A4 1 枚に。お札マンの発表は、速さを変えられ、止まったら「つづける」が出ます。' },
    { date: '2026-11-16', seal: '取', tone: 'green', href: 'glossary.html#karuta', eyebrow: '用語辞典', title: '経済ことばかるた', text: 'お札マンが読む説明を聞いて、畳の上の 12 枚から言葉の札をとる。10 枚で勝負。分野もえらべます。' },
    { date: '2026-11-16', seal: '大', tone: 'shu', href: 'quiz.html#taikai', eyebrow: 'クイズ', title: 'みんなでクイズ大会', text: '教室や文化祭で、プロジェクターに映して班対抗。時間の輪、正解の発表、班ごとの点数、最後は表彰台。96 問から出題します。' },
    { date: '2026-11-16', seal: '問', tone: 'dark', href: 'index.html#deck', eyebrow: '紹介', title: 'お札マンに質問できるように', text: '発表のまとめで、お札マンに 5 つの質問ができます。お金のめぐりの図を小さなお札が走り、最後は麻経券が舞います。効果音も。' },
    { date: '2026-11-16', seal: '案', tone: 'green', href: 'quiz.html', eyebrow: '案内', title: 'お札マンの案内を、4 つのページにも', text: 'クイズ・経済ラボ・用語辞典・麻布経済展でも、見出しの下の「お札マンと、このページを回る」から、段ごとに案内します。' },
    { date: '2026-11-16', seal: '案', tone: 'shu', href: 'index.html', eyebrow: 'トップ', title: 'お札マンと、トップを回る', text: 'お札マン（仮）がトップの 9 つの段を順に案内。スポットライトが当たった段を、ふきだしで説明します。自分のペースで「次へ」。' },
    { date: '2026-11-15', seal: '券', tone: 'dark', href: 'sim.html#tsuuka', eyebrow: '経済ラボ', title: 'お祭りの券のルールを決める工房', text: '何枚用意する？ どう配る？ 何軒で使える？ にせもの対策は？ 遊び用の券のルールしだいで、団子の値段も買える人も信用も変わる。'  },
    { date: '2026-11-15', seal: '映', tone: 'dark', href: 'index.html#deck', eyebrow: '紹介', title: 'お札マンが、紹介スライドを発表', text: '「発表」を押すと、お札マン（仮）が横で紹介。話している場所がスライドの上で光り、うれしい・おどろき・考える・しょんぼりの顔も。' },
    { date: '2026-11-15', seal: '換', tone: 'shu', href: 'quiz.html#koukan', eyebrow: 'クイズ', title: '交換の島', text: '魚を持って、本がほしい。物々交換だと何回かかる？ 同じ島に貝のお金があったら？ くらべて、お金の役割を手で確かめる。' },
    { date: '2026-11-15', seal: '進', tone: 'green', href: 'quiz.html#shinka', eyebrow: 'クイズ', title: 'お金の進化', text: '物々交換、貝、和同開珎、紙のお金、円と日本銀行券、そしてスマホの中の数字へ。6 つの場面を横にめくって。' },
    { date: '2026-11-15', seal: '報', tone: 'green', href: 'dayori.html', eyebrow: '麻経だより', title: '月刊「麻経だより」', text: 'その月に新しくなったこと、経済の暦、今月の言葉を、新聞のかたちで 1 枚に。A4 で印刷して掲示もできます。' },
    { date: '2026-11-15', seal: '釣', tone: 'gold', href: 'quiz.html#otsuri', eyebrow: 'クイズ', title: 'おつりの達人', text: 'お店の人になって、おつりをわたす 60 秒勝負。いちばん少ない枚数でわたせたら 2 点。小学生にもおすすめ。' },
    { date: '2026-11-15', seal: '創', tone: 'shu', href: 'sim.html#koubou', eyebrow: '経済ラボ', title: '村の税の仕組みをつくる', text: '10 人の村で、税の集め方と使い道を自分で決める。手取りの差、道路や学校、働く気持ちはどう変わる？' },
    { date: '2026-11-14', seal: '町', tone: 'green', href: 'sitemap.html', eyebrow: 'サイトマップ', title: '経済の町の地図', text: 'このサイトの 14 のページを、町の建物に。行ったことのある建物には「済」の札。町をぜんぶ回れるかな。' },
    { date: '2026-11-14', seal: '尻', tone: 'shu', href: 'glossary.html#shiritori', eyebrow: '用語辞典', title: '経済しりとり', text: '辞典の言葉だけで、コンピューターとしりとり。15 秒以内に選んで、「ん」で終わる言葉にはご用心。' },
    { date: '2026-11-13', seal: '辞', tone: 'green', href: 'glossary.html', eyebrow: '用語辞典', title: '辞典が 300 語に', text: '「経済」「一人あたり GDP」「日銀短観」「逆進性」「地租改正」「インバウンド」「生成 AI」など 24 語を新しく。'},
    { date: '2026-11-13', seal: '巡', tone: 'gold', href: 'sim.html#meguri', eyebrow: '経済ラボ', title: 'お金のめぐり', text: '家計・企業・銀行・政府のあいだを流れるお金を、動く図で。「1 万円のゆくえ」で順にたどれます。' },
    { date: '2026-11-13', seal: '券', tone: 'shu', href: 'festival.html#bill', eyebrow: '文化祭', title: '麻経券をデザインする', text: '金額・色・まん中の絵・名前を選んで、自分だけの遊び券を絵に。画像で保存できます。' },
    { date: '2026-11-11', seal: '映', tone: 'green', href: 'index.html#deck', eyebrow: '紹介', title: '1 分でわかる麻経', text: '画面いっぱいの 13 枚のスライドで、親しむ・知る・つくるの流れにそって麻経を紹介。自動で進みます。' },
    { date: '2026-11-11', seal: '探', tone: 'shu', href: 'glossary.html#newsfind', eyebrow: '用語辞典', title: 'ニュースの言葉さがし', text: '読みたい記事を貼りつけると、辞典にある言葉に印がつく。押せば、その場で意味が開きます。' },
    { date: '2026-11-10', seal: '暦', tone: 'gold', href: 'events.html#koyomi', eyebrow: '日程とイベント', title: '経済の暦', text: '「円」が生まれた日、プラザ合意、リーマン・ショック。月ごとに 33 のできごと。今日は、経済の何の日？' },
    { date: '2026-11-10', seal: '修', tone: 'shu', href: 'festival.html#athome', eyebrow: '文化祭', title: '家で回る麻布経済展', text: '会場を歩く・クイズ・カード・クロスワード・診断の 5 つで、朱印のスタンプ。そろったら、修了証を画像で。' },
    { date: '2026-11-10', seal: '札', tone: 'green', href: 'quiz.html#cardgame', eyebrow: 'クイズ', title: '経済カード勝負', text: '預金・債券・株・外貨・起業の 5 枚。ニュースの予報を読んで出して、相手と 5 回勝負。' },
    { date: '2026-11-10', seal: '刷', tone: 'gold', href: 'glossary.html#sheet', eyebrow: '用語辞典', title: '授業で使えることばプリント', text: '分類と問題の数を選んで、印刷するだけ。説明を読んで言葉を答える A4 プリント。答えは 2 枚目に。' },
    { date: '2026-11-09', seal: '辞', tone: 'green', href: 'glossary.html', eyebrow: '用語辞典', title: '辞典が 276 語に', text: '「はたらくこと」「環境と資源」の分類が新しく。賃金・春闘・カーボンニュートラルなど 67 語を足しました。' },
    { date: '2026-11-09', seal: '字', tone: 'shu', href: 'quiz.html#crossword', eyebrow: 'クイズ', title: '経済クロスワード', text: '為替・株式・金利など 14 語。ひらがなで答えて、二重マスの最後の問題へ。' },
    { date: '2026-11-06', seal: '暦', tone: 'green', href: 'events.html#yearplan', eyebrow: '日程とイベント', title: '1 年の流れ', text: 'ストックリーグのレポート提出は 1/8、文化祭は 11 月下旬に査定。コンテストと文化祭の準備が、いつ何をするかを 1 枚の表に。' },
    { date: '2026-10-31', seal: '策', tone: 'shu', href: 'sim.html#nesage', eyebrow: '経済ラボ', title: 'となりのお店と値下げ競争', text: '値段を守る？ 値下げする？ となりのお店と同時に選んで 10 回勝負。相手の作戦は最後にわかる。ゲーム理論の体験。' },
    { date: '2026-10-30', seal: '録', tone: 'green', href: 'mypage.html', eyebrow: 'わたしの記録', title: '経済力レーダー', text: 'ことば・クイズ・実験・計画・探検。遊んだ記録から 5 つの力を五角形に。得意な力と、のびしろの力がわかる。' },
    { date: '2026-10-30', seal: '並', tone: 'shu', href: 'glossary.html#narabe', eyebrow: '用語辞典', title: 'ことばならべかえ', text: '説明を読んで、バラバラのひらがなを正しい順に。1 回 5 問、ヒントなしで正解すると 2 点。称号と自己ベストつき。' },
    { date: '2026-10-29', seal: '銀', tone: 'gold', href: 'sim.html#ginko', eyebrow: '経済ラボ', title: '銀行のふしぎ', text: 'あずけた 1 万円が貸し出されて、また預金に。12 人のお金の旅で、みんなの預金がいくらになるか。信用創造を体験。' },
    { date: '2026-10-28', seal: '双', tone: 'gold', href: 'quiz.html#sugoroku', eyebrow: 'クイズ', title: '経済すごろく', text: 'サイコロ 12 回で、1,000 円をいくらに？ 給料・税金・利息・投資・保険・ハプニングのマスをめぐる。' },
    { date: '2026-10-28', seal: '籤', tone: 'shu', href: 'index.html#omikuji', eyebrow: 'ホーム', title: '経済おみくじ', text: '箱をふると、おみくじがひらく。今日の運勢と、ラッキーことば・ラッキー実験。1 日 1 回。' },
    { date: '2026-10-28', seal: '株', tone: 'green', href: 'sim.html#kabu', eyebrow: '経済ラボ', title: '株式会社をつくろう', text: '3 人でお金を出しあって会社に。株の円グラフ、多数決で決められる人、配当の分け方が、スライダーで動く。' },
    { date: '2026-10-27', seal: '図', tone: 'dark', href: 'glossary.html#wordmap', eyebrow: '用語辞典', title: 'ことばの地図', text: 'まん中の言葉に、つながる言葉が輪になって並ぶ。押すたびに地図が動いて、言葉から言葉へ旅できる。' },
    { date: '2026-10-27', seal: '籤', tone: 'gold', href: 'sim.html#kuji', eyebrow: '経済ラボ', title: 'くじ引きの期待値', text: '300 円のくじ、平均するといくら戻る？ 予想して 100 回引くと、平均が「期待値」の線に近づいていく。' },
    { date: '2026-10-27', seal: '速', tone: 'shu', href: 'glossary.html#rush', eyebrow: '用語辞典', title: 'ことば○×ラッシュ', text: '言葉と説明、合ってる？ 30 秒で答えまくる。コンボで点がふえて、4 段階の称号つき。' },
    { date: '2026-10-27', seal: '税', tone: 'paper', href: 'sim.html#receipt', eyebrow: '経済ラボ', title: 'レシートの中の税金', text: '商品をかごに入れると、レシートが印字される。同じおにぎりでも、店内で食べると税率が変わる。' },
    { date: '2026-10-27', seal: '分', tone: 'green', href: 'sim.html#bungyo', eyebrow: '経済ラボ', title: '分業のふしぎ', text: '何でも速い A さんと、ゆっくりの B さん。ポスター 6 枚とクッキー、どう分けるといちばん得？' },
    { date: '2026-10-26', seal: '運', tone: 'gold', href: 'glossary.html#gacha', eyebrow: '用語辞典', title: '経済ことばガチャ', text: 'レバーを回すとカプセルが転がり出て、209 語のどれかに出会える。' },
    { date: '2026-10-26', seal: '昇', tone: 'shu', href: 'sim.html#infl', eyebrow: '経済ラボ', title: 'インフレのタイムマシン', text: '物価が上がると、1,000 円で買えるおにぎりは何個に？ 年数を動かすと、少しずつ消えていく。' },
    { date: '2026-10-26', seal: '予', tone: 'green', href: 'sim.html#budget', eyebrow: '経済ラボ', title: '国の予算を、100 円にたとえると？', text: 'いちばん多い使いみちを予想してから開くと、100 円玉がグラフに分かれる。' },
    { date: '2026-10-26', seal: '作', tone: 'paper', href: 'quiz.html#make', eyebrow: 'クイズ', title: '問題を、つくってみよう', text: '経済の問題と 4 つの答えを書くと、その場で遊べる。いい問題は AZAKEI に送れます。' },
    { date: '2026-10-24', seal: '億', tone: 'dark', href: 'sim.html#oku', eyebrow: '経済ラボ', title: '1 億円って、どれくらい？', text: '一万円札を積むと、高さと重さは？ 東京タワーや富士山とくらべてみよう。' },
    { date: '2026-10-23', seal: '貨', tone: 'gold', href: 'quiz.html#coins', eyebrow: 'クイズ', title: '世界のお金図鑑', text: 'この国のお金は？ 正解すると、コインがくるっと回って図鑑に入る。' },
    { date: '2026-10-23', seal: '店', tone: 'shu', href: 'sim.html#shop', eyebrow: '経済ラボ', title: '文化祭でお店をひらこう', text: '何個売れたら黒字？ 損益分岐点を、グラフと店長ミッションで。' },
    { date: '2026-10-23', seal: '豆', tone: 'green', href: 'glossary.html', eyebrow: 'お札マン', title: 'お札マンの、お金の豆知識', text: 'お札マンを押すと、1 円玉の重さや新しいお札のひみつを話してくれる。全 12 話。' },
    { date: '2026-10-21', seal: '読', tone: 'paper', href: 'glossary.html#headline', eyebrow: '用語辞典', title: 'ニュースの見出しを、読みとく', text: '「日銀、利上げ」ってどういうこと？ よく見る見出し 6 つを、新聞の切り抜き風に。' },
    { date: '2026-10-21', seal: '為', tone: 'dark', href: 'sim.html#fx', eyebrow: '経済ラボ', title: '円高・円安の両替所', text: '1 ドルが何円かを動かすと、ハンバーガーの値段が変わる。3 問全問正解でバッジ。' },
    { date: '2026-10-20', seal: '歴', tone: 'shu', href: 'glossary.html#nenpyo', eyebrow: '用語辞典', title: '年表ゲーム「どっちが先？」', text: 'バブルとオイルショック、先に起きたのは？ 8 問連続正解で「歴史通」。' },
    { date: '2026-10-20', seal: '録', tone: 'gold', href: 'mypage.html', eyebrow: 'あなたの記録', title: 'わたしの記録', text: '自己ベスト、覚えた言葉、集めたバッジ。5 段階の称号つき。' },
    { date: '2026-10-20', seal: '種', tone: 'green', href: 'contests.html#plan-seed', eyebrow: 'コンテスト', title: 'ビジネスプランのたね', text: '6 つの欄をうめると、自分のビジネスプランが 1 枚のカードに。' }
  ],

  /* ---- SNS ---- */
  sns: [
    { name: 'Instagram', handle: '@azakei_vlog', url: 'https://www.instagram.com/azakei_vlog/', desc: '活動報告・Vlog・お問い合わせ（DM）' },
    { name: 'X', handle: '@azakeiten', url: 'https://x.com/azakeiten', desc: '最新情報をいち早く' }
  ],

  /* ---- お問い合わせ設定 ----
     formEndpoint: FormSubmit の送信先（https://formsubmit.co/ajax/〈メールアドレス or 有効化後の英数字〉）
                   ここに送ると AZAKEI の Gmail にメールが届きます。
     email:        formEndpoint が空のとき、メールソフトを開いて送る宛先
     どちらも空なら、下の instagram アカウントの DM へ案内します。 */
  contact: {
    formEndpoint: 'https://formsubmit.co/ajax/azakeiten@gmail.com',
    email: 'azakeiten@gmail.com',   // フォームが送れないときの予備（メールで送る）
    instagram: { handle: '@azakei_vlog', url: 'https://www.instagram.com/azakei_vlog/' }
  },

  /* ---- 生きている経済の数字（トップ） ----
     年間の名目GDPを1年の秒数で割り、今年1月1日から今までの分を数え上げて表示します。
     新しい年の数字が発表されたら、annualYen・year・source を書き換えるだけ。 */
  liveEconomy: {
    year: '2025年度',
    annualYen: 672.7e12,
    source: '内閣府 経済社会総合研究所「国民経済計算」2025年度 名目GDP 672.7兆円（2026年9月公表）'
  },

  /* ---- 文化祭投票 ----
     firebase に設定（Firebase コンソールの firebaseConfig）を入れると、
     票は Firestore に保存されます（1人1票をサーバー側のルールで保証）。
     firebase が null の間は、仮の保存先（Abacus）を使います。
     年度を変えるときは pollId を 'festival-2028' のように変えると 0 票から始まります。
     ※ 選択肢の key を変えたら firestore.rules の options() も同じに直すこと。 */
  firebase: {
    apiKey: 'AIzaSyBHw0uo7i1aTQ45UI_nNWsN8Ljb_C7C6J4',
    authDomain: 'azakei.firebaseapp.com',
    projectId: 'azakei',
    storageBucket: 'azakei.firebasestorage.app',
    messagingSenderId: '616148078496',
    appId: '1:616148078496:web:216b60254a70665696dec5'
  },
  vote: {
    pollId: 'festival-2027',
    namespace: 'azakei-festival-vote-2027',
    question: '次の麻布経済展、どんな展示が見たい？',
    options: [
      { key: 'same',    label: '2026 年と同じ',    en: 'Same as 2026', desc: 'チップを増やす体験型展示を、もう一度。' },
      { key: 'econ',    label: 'ガチ経済系',       en: 'Hardcore Economics', desc: '株・金融・マクロ経済を本気で深掘り。' },
      { key: 'fun',     label: '面白系',           en: 'Just for Fun', desc: 'とにかく笑えて、楽しい展示。' },
      { key: 'insta',   label: 'Instagram映え系',  en: 'Photogenic', desc: '思わず写真を撮りたくなる空間。' },
      { key: 'food',    label: '飲食系',           en: 'Food & Drink', desc: '食べて、飲んで、経済を体感。' },
      { key: 'life',    label: '人生系',           en: 'Life & Money', desc: 'お金・キャリア・生き方を考える。' },
      { key: 'society', label: '社会系',           en: 'Society', desc: '社会の課題を、経済で読み解く。' }
    ]
  },

  /* ---- 日程・イベント ----
     date は 'YYYY-MM-DD'。日付未定なら date を空にして when に文字で書く。 */
  // 文化祭の来場者（2026 年）。1〜3 日目
  visitors: { total: 2364, days: [492, 1152, 720] },
  // 日程と活動日誌は、部員用 更新ページ（admin.html）から書きます（Firebase に保存）。
  // ここに直接書くこともできますが、管理ページで直せなくなるので使わないでください。
  events: [],

  /* ---- 活動風景（写真） ----
     src を空にすると「写真準備中」の枠になります。 */
  gallery: [
    { src: 'photos/room-diagnosis.jpg', caption: '展示会場（エコノミスト診断のポスター）', date: '2026.05' },
    { src: 'photos/hallway-wave.jpg', caption: '廊下の飾りつけ「麻経」の大波', date: '2026.05' },
    { src: 'photos/setup.jpg', caption: '準備中。パネルを組み立てる', date: '2026' },
    { src: 'photos/board-millionaire.jpg', caption: '黒板の「本日の億万長者」', date: '2026.05' },
    { src: 'photos/hallway-game.jpg', caption: '廊下の入口。「GAME」の看板', date: '2026.05' },
    { src: 'photos/member-pizza.jpg', caption: 'おつかれさまのピザ', date: '2026.05' },
    { src: 'photos/room-paper.jpg', caption: '「紙展」のパネルとカードゲームの卓', date: '2026.05' },
    { src: 'photos/star-bills.jpg', caption: '入口の六芒星と、オリジナルの券', date: '2026.05' },
    { src: 'photos/balloons.jpg', caption: '文化祭のフィナーレ', date: '2026.05' },
    { src: 'members.jpg', caption: 'メンバー集合', date: '2026' },
    { src: 'photos/star-door.jpg', caption: '中3-5 教室の入口', date: '2026.05' },
    { src: 'photos/board-special.jpg', caption: '特別時間の黒板と倍率表', date: '2026.05' }
  ],

  /* ---- 何気ない日常 ---- */
  diary: [],

  /* ---- 実績（いつか） ----
     ここに追加すると、トップと「麻経とは」に表示されます。 */
  achievements: [
    // stat（大きく出す数字）・unit・label・link は書かなくても OK
    { year: '2026', title: '文化祭「麻布経済展」を開催', stat: '2,364', unit: '人', label: '3 日間の来場者', link: 'festival.html' },
    { year: '2026', title: '日経ストックリーグに応募', label: '9 月 4 日に応募。ポートフォリオとレポートに挑戦中', link: 'contests.html#stockleague' },
    { year: '2026', title: '高校生ビジネスプラン・グランプリに応募', label: '9 月 24 日、ビジネスプランのシートを提出。結果発表は 11 月中', link: 'contests.html#business' }
  ]
};
