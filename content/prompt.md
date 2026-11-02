# 問題を作るためのプロンプト

LLM で問題を作るときに使うプロンプト。使い方は次のとおり。

1. 下の「プロンプト」の節を写し、`{{分類の id}}` を作る分類の id に書き換える。分類の id は `docs/specs/question-format.md` の「分類」の節にある。
2. `content/perspectives.md`（観点シート）を添えて、LLM に渡す。
3. 返ってきた JSON の中身を確かめ、直してから `content/questions/<分類の id>.json` に入れる（[D-0002](../docs/decisions/D-0002-question-source.md)）。

形の決まりを変えたときは、`docs/specs/question-format.md` とこのプロンプトを同じ PR で書き換える。

## プロンプト

````text
添付の観点シートをもとに、数式の英語での読み方を問う並び替えの問題を作ってください。

# 作る問題

- 分類の id: {{分類の id}}
- 観点シートの、この分類に当たる節の観点（節 8 では式）を、1つずつ問題にしてください。1つの観点から、数式を変えて複数の問題を作ってもかまいません。
- 読み方は、観点シートの例の読み方に合わせてください。
- 数式の書き方は、観点シートの「LaTeX」の列に合わせてください（例: 二項係数は \binom{n}{k}、絶対値は \lvert x \rvert）。

分類の id と観点シートの節の対応は次のとおりです。

| 分類の id | 観点シートの節 |
|---|---|
| numbers | 1. 数（numbers） |
| fractions | 2. 分数（fractions） |
| scripts-powers-roots | 3. 添え字・累乗・根号（suffixes, powers, roots） |
| arithmetic | 4. 四則演算・括弧 |
| vectors-functions | 5. ベクトル・行列・関数 |
| calculus | 6. 微分・積分・総和 |
| relations | 7. 等式・不等式・関係記号 |
| combined | 8. まとまった数式 |

# 出力の形

次の形の JSON だけを返してください。JSON の前後に説明を書かないでください。

{
  "category": "scripts-powers-roots",
  "questions": [
    {
      "id": "scripts-powers-roots-001",
      "perspective": "n乗（序数＋power）",
      "latex": "x^5",
      "answers": [
        { "cards": ["x", "to", "the", "fifth", "power"] },
        { "cards": ["x", "to", "the", "fifth"] }
      ],
      "distractors": ["five"]
    }
  ]
}

- category: 分類の id。
- id: 「<分類の id>-<3桁の連番>」。001 から順に付けてください。
- perspective: もとにした観点。節 1〜7 では観点シートの表の「観点」の欄、節 8 では「式」の欄の式の名前（例: 解の公式）を、そのまま写してください。
- latex: 画面に描く数式。KaTeX で描ける LaTeX にしてください。$ で囲まないでください。
- answers: 正解の配列。cards には、読み方を並べる順に札で書いてください。
  - 読み方が複数ある数式では、正解を複数書いてください（例: times と multiplied by、equals と is equal to）。
  - 答えを見せるときにカンマを入れたい読み方では、cards とは別に text を書いてください（例: "text": "x equals negative b plus or minus the square root of b squared minus four a c, all over two a"）。text からカンマを除いたものは、cards を半角スペースでつないだものと同じにしてください。
- distractors: まぎらわしい札。観点の誤りやすい点に沿った札にしてください（例: three million に対する millions）。answers の札と同じ文字列は入れないでください。なければ空の配列にしてください。

# 札の決まり

- 札は単語で区切るのを基本としてください。長い式（節 8）では、意味のまとまり（例: the square root of）を1枚の札にしてかまいません。
- 札には句読点（, . ; : ! ?）を入れないでください。
- 札の前後に空白を入れず、単語の間の空白は半角スペース1つにしてください。
- 大文字と小文字は、数式の文字に合わせて書き分けてください（例: F of omega の F と、f of t の f）。判定では大文字と小文字を区別します。
````
