# App Store の掲載情報

App Store Connect に入力する内容を書く。公開の URL の決め方は [D-0034](decisions/D-0034-store-pages.md) にある。

## 共通の項目

| 項目 | 内容 |
|---|---|
| 名前 | merb |
| カテゴリ | 教育 |
| 価格 | 無料 |
| 配信地域 | すべての地域 |
| 著作権 | 2026 adelppi |
| プライバシーポリシー | https://adelppi.github.io/merb/privacy.html |
| サポート | https://adelppi.github.io/merb/support.html |

## 日本語の掲載文

サブタイトル: 数式を英語で読む

説明文:

```text
merb は、数式の英語での読み方を、問題を解きながら学ぶアプリです。

画面に出た数式の読み方を、英語の札を並べて答えます。札はタップかドラッグで動かせます。読み方が複数ある数式では、どの読み方も正解になります。

正解のあとと答えを見たあとは、読み方を英語の音声で聞けます。

間違えたときは、そのまま札を並べ直すか、答えを見るかを選べます。間違えた問題は端末に記録され、あとで間違えた問題だけを解き直せます。

出題の範囲は分類から選べます。画面の言語は日本語と英語に対応しています。

アカウントの登録はありません。
```

キーワード: `数学,数式,英語,読み方,math,English,LaTeX`

## 英語の掲載文

Subtitle: Read math in English

Description:

```text
merb teaches you how to read mathematical expressions in English by solving questions.

For each expression on the screen, arrange English cards to answer with its reading. Move the cards by tapping or dragging. When an expression has several readings, each one is accepted.

After a correct answer, or after looking at the answer, you can listen to the reading in English.

If you get a question wrong, rearrange the cards right away or look at the answer. Wrong questions are recorded on your device, so you can retry just those questions later.

Choose which categories to practice. The app is available in Japanese and English.

No account is needed.
```

Keywords: `math,mathematics,English,reading,expression,LaTeX,study`

## プライバシーの申告

アプリは EAS Update のために、インストールごとのランダムな id を Expo に送る。そのため、「データを収集しない」とは答えず、次のとおり申告する。

| 質問 | 回答 |
|---|---|
| データの種類 | 識別子のうち「デバイス ID」 |
| 利用目的 | アプリの機能 |
| ユーザーへのリンク | リンクしない |
| トラッキング | 使用しない |

## 年齢区分

暴力、性的な内容、賭博などの質問は「なし」で答える。アカウントがなく、利用者同士のやり取りもない。新しい質問は、回答のときに内容を確かめる。

## 輸出コンプライアンス

`app.json` の `ios.config.usesNonExemptEncryption` を `false` にしてあるので、提出のたびの回答は要らない。
