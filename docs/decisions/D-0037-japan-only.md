# D-0037 最初の公開は日本だけで配信する

- 日付: 2026-11-07
- 決めた人: adelppi（Issue #96）
- 関係する Issue と PR: #96
- 解決した未解決の項目: なし
- 置き換える記録: D-0031 のうち、全地域に配信する点

## 背景

D-0031 で全地域に配信すると決めた。提出の準備で、EU のトレーダーの申告と、中国本土の ICP の届出を確かめる必要が出た。

## 決定

- 配信地域は日本だけにする。
- 新しい国や地域に自動で配信する設定は使わない。
- トレーダーかどうかの申告は、EU に配信しなくても行う。

## ほかの選択肢

- 全地域に配信する案。adelppi の判断で採らなかった。

## 根拠

- [Apple の資料](https://developer.apple.com/help/app-store-connect/manage-compliance-information/manage-european-union-digital-services-act-trader-requirements/)に、EU で配信しなくてもトレーダーの申告が要るとある。
- [Apple の資料](https://developer.apple.com/help/app-store-connect/manage-your-apps-availability/manage-availability-for-your-app-on-the-app-store/)に、配信地域は審査の提出の前に設定するとある。

## 影響

- `docs/store-listing.md` を書き換えた。
