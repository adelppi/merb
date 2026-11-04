# D-0024 ホームも Stack のネイティブヘッダーで見出しとボタンを出し、ヘッダーの設定を1か所にまとめる

- 日付: 2026-11-04
- 決めた人: Claude Code（Issue #56 の指示に沿って決めた。adelppi が PR で確かめる）
- 関係する Issue と PR: #56
- 解決した未解決の項目: なし
- 置き換える記録: なし。D-0018 のうち、ホームの歯車を `GlassCircleButton` で出す点だけを、ヘッダーのボタンに変える。iOS 26 以上で Liquid Glass、それより前は通常の背景という方針は変えない

## 背景

#49 で、分類を選ぶ画面と設定に iOS 純正の大タイトルを使った。ホームだけは、画面の中に文字「merb」と丸いボタンを置いていたので、遷移したときの見出しの動きが画面ごとにそろっていなかった。参考にした chalo（adelppi/chalo）は、見出しを Stack の大タイトルで出し、ボタンを `unstable_headerLeftItems` と `unstable_headerRightItems` のネイティブのボタンで出す。ヘッダーの設定は `headerItems.ts` の関数にまとめている。

## 決定

- ホーム（`/`）も Stack の画面にし、ヘッダーを出す。見出し「merb」は大タイトルで出し、書体は従来どおり Times New Roman にする。ヘッダーの背景は透明にする。
- 設定を開く歯車は、ヘッダー右のネイティブのボタン（`unstable_headerRightItems`）で出す。読み上げ用の名前は、これまでどおり「設定」（英語では「Settings」）にする。`sharesBackground: false` を付け、iOS 26 の Liquid Glass で複数のボタンが1つにつながらないようにする。
- 大タイトルとヘッダーの設定は、`src/components/headerOptions.ts` に関数でまとめ、`_layout.tsx` の各画面から呼ぶ。
- 画面の中に置いていた丸いボタンの部品（`GlassCircleButton`）は、使う画面がなくなるので消す。
- タブ（`NativeTabs`）は入れない。merb の画面はホームから Stack で進む1本の流れで、タブに分ける画面がない。

## ほかの選択肢

- ホームだけ自作の見出しとボタンを残す案。見出しの動きと、ボタンの見た目の更新（OS ごとのガラス）を、画面ごとに自前で合わせ続けることになるので採らなかった。
- `NativeTabs` で、ホームと設定をタブに分ける案。設定は言語の切り替えだけで、タブにするほどの画面でなく、[vision.md](../vision.md) の画面がシンプルであるという基準にも合わないので採らなかった。

## 根拠

- 見出しとボタンを OS 標準のヘッダーに任せると、iOS 26 の Liquid Glass とスクロールに連動する大タイトルが追加の実装なしに揃う。
- ヘッダーの設定の重複が、`_layout.tsx` の3画面で出ていた。関数にまとめれば、画面を足したときも1行で済む。

## 影響

- `docs/specs/i18n.md` の振る舞い7、9 を、ヘッダーのボタンに合わせて書き換える。
- `docs/design/README.md` の差の表に、ホームの見出しとボタンの出し方を足す。
- `src/app/index.tsx`、`src/app/_layout.tsx` を変え、`src/components/headerOptions.ts` を足す。`GlassCircleButton.tsx` を消す。
