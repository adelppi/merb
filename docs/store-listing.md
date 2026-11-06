# App Store の掲載情報

App Store Connect に入力する内容を書く。公開の URL の決め方は [D-0034](decisions/D-0034-store-pages.md) にある。

## 共通の項目

| 項目 | 内容 |
|---|---|
| 名前 | merb |
| 主な言語 | 日本語 |
| カテゴリ | 教育 |
| 価格 | 無料 |
| 配信地域 | 日本だけ（[D-0037](decisions/D-0037-japan-only.md)） |
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

日本だけで配信するので、入力は任意にする。

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

## スクリーンショット

`~/Desktop/merb-store-screenshots/` の画像を使う。リポジトリには入れていない。

| フォルダ | サイズ | 扱い |
|---|---|---|
| `medium` | 1206 × 2622 | 必須 |
| `large` | 1320 × 2868 | 任意 |

## 配信地域の設定

「価格および配信状況」の「App の配信状況」で、「特定の国または地域」を選び、日本だけを選ぶ。今後追加される国や地域に自動で配信する項目は選ばない。審査に提出する前に設定する。

## トレーダーの申告

EU に配信しなくても、トレーダーかどうかの申告が要る。Account Holder か Admin が、「ビジネス」の「契約」にある Digital Services Act の項目で申告する。トレーダーに当たるかどうかは、Apple の案内を読んで adelppi が判断する。

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

## 審査用のメモ

App Review の Guideline 2.1 の指摘に答える文面である。App Review Information の Notes に入れる。`[RECORDING]` は、実機の画面収録を渡す方法に置き換える。

```text
1. Screen recording
[RECORDING]
The recording was captured on a physical iPhone. It starts by launching the app and shows the typical flow. The app has no account registration, login, user-generated content, or paid content.

2. Purpose and target audience
merb is a study app for math learners educated in Japanese who want to express mathematics in English. Such learners often can read expressions only in Japanese. merb solves this by letting them practice the English reading of expressions: the app shows an expression, and the user arranges English cards to form its reading.

3. Setup and main features
No login, account, setup, or sample files are needed.
- The app opens in Japanese. To use English, tap the gear at the top right and choose English, then go back.
- Select one or more categories on the home screen, then tap "Start with selected".
- Tap or drag cards into the answer area, then tap "Check".
- After a correct answer or after "Show answer", tap a speaker button to hear the reading. Speech does not play while the iPhone is in silent mode.
- Tap "Next question" to continue. Questions answered incorrectly can be retried with "Missed questions" on the home screen.

4. External services
The app uses Expo EAS Update to check for and deliver app updates. It uses the iOS speech synthesis feature for audio. All questions are bundled in the app. The app calls no AI service while running; question content was prepared in advance with the help of a large language model during development, checked, and included in the app. There is no authentication service, payment processor, or external data provider.

5. Regional differences
The app is distributed only in Japan. Its features and content do not differ by region.

6. Regulated industry and third-party material
The app is not in a regulated industry and does not include protected third-party material. It uses open-source libraries, and the questions are written for this app.
```

## 輸出コンプライアンス

`app.json` の `ios.config.usesNonExemptEncryption` を `false` にしてあるので、提出のたびの回答は要らない。
