# D-0019 文言の切り替えは自作の Context、言語の保存は AsyncStorage にする

- 日付: 2026-11-03
- 決めた人: AI が候補を調べて推奨を選び、adelppi が PR で確かめる
- 関係する Issue と PR: #37
- 解決した未解決の項目: OQ-015 のうち、文言の切り替えと言語の保存
- 置き換える記録: D-0003 のうち、文言の切り替え（next-intl）の点。D-0006 のうち、言語をブラウザーのローカルストレージに保存する点、ページを静的に作る点、next-intl を使う点。言語を URL に含めないこと、保存がなければ日本語で出すこと、設定画面だけで切り替えることは変えない

## 背景

[D-0012](D-0012-native-app.md) でアプリをネイティブにしたので、D-0003 の next-intl と、D-0006 のブラウザーのローカルストレージは使えない。文言の切り替えと言語の保存に使うものを選び直す必要があった。基準は `vision.md` の判断の基準のうち、画面がシンプルであること（依存を増やさないことを含む）。Expo SDK 58、iOS だけが対象（[D-0014](D-0014-ios-expo-router.md)）。言語の決め方は D-0012 のとおり、設定画面で選び、端末に保存し、保存がなければ日本語にする。

## 決定

- 言語は `@react-native-async-storage/async-storage` に、キー `merb.locale`、値 `ja` か `en` で保存する。バージョンは Expo SDK 58 が指定する 2.2.0 にする（`expo install` が選ぶバージョン）。
- 文言の切り替えは、自作の React Context で行う。ライブラリは足さない。
  - `src/i18n/provider.tsx` の `I18nProvider` が、保存した言語を読み、`useI18n()` で `locale`、`setLocale`、`messages` を返す。
  - 文言は、既存の `src/i18n/messages.ts` の `messages[locale]` をそのまま使う。キーは型で補完される。
  - 保存と読み出しは、`src/i18n/storage.ts` の純粋に近い関数（保存先を引数で受ける）にし、Vitest で確かめる。
- 保存した言語を読み終えるまで、画面を出さない。英語を保存した人に、日本語が一瞬見えないようにするためである（D-0006 の「差し替わるまで本文を見せない」と同じ）。
- 端末の言語の設定には合わせない（D-0012）。`expo-localization` は入れない。
- アイコンは `expo-symbols`（SF Symbols）、Liquid Glass は `expo-glass-effect` で出す。iOS 26 より前、または Liquid Glass が使えないときは、通常の半透明の背景で出す（D-0018）。

## ほかの選択肢

言語の保存

- `expo-sqlite/kv-store`。Expo 製で、AsyncStorage と同じ呼び出しで使える。`expo-sqlite` 全体が依存に入り、キー1つを残すには大きいので採らなかった。
- `expo-secure-store`。Keychain に保存する。言語は秘密の値ではなく、用途が合わないので採らなかった。
- `@react-native-async-storage/async-storage` の 3.1.1。Expo SDK 58 が指定するバージョンは 2.2.0 なので、SDK の指定に従った。

文言の切り替え

- `i18next` と `react-i18next`。複数形、補間、名前空間、言語の自動判定を持つが、merb の文言は2言語で少なく、使わない機能が多い。依存が2つ増えるので採らなかった。
- `i18n-js`、`expo-localization` との組み合わせ。端末の言語に合わせる前提の作りで、D-0012 の決定と合わないので採らなかった。

## 根拠

- AsyncStorage は、キーと値を端末に残す用途に合い、Expo SDK 58 の指定にも入っている。最終更新は 2.2.0 が 2025 年 6 月、3.1.1 が 2026 年 5 月で、メンテされている。
- 文言は `{ ja, en }` の2つの JSON を切り替えるだけで、Context と型（`Messages = typeof ja`）で足りる。キーの誤りは型検査で見つかり、2つのファイルのキーが同じことは既存の単体テストで確かめている。
- 文言を取り出す関数を自作しても、画面を作る #35、#36 は `useI18n()` の `messages` を読むだけで済む。あとで複数形などが要れば、`i18next` に替えても呼び出し側の変更は小さい。

## 影響

- `docs/specs/i18n.md` を、端末への保存に合わせて書き換えた。
- `open-questions.md` の OQ-015 の「残っている分」から、文言の切り替えと言語の保存を「解決した分」へ移した。
- `package.json` に `@react-native-async-storage/async-storage`、`expo-symbols`、`expo-glass-effect` を足した。
- `src/i18n/` に `storage.ts` と `provider.tsx` を、`src/components/` に画面の部品を、`src/app/` に設定画面を置いた。
