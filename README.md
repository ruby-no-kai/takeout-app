# README


## Todos

- [x] navbar リンク・デザイン
- [x] attendee ログイン
  - [x] デザイン
- [x] attendee 設定
  - [x] デザイン
- [x] be: 複数トラックの設定
- [x] fe: IVS embed
- [x] fe: チャット
  - [ ] fe: チャットのオートスクロールもうすこし賢くする
  - [x] デザイン
  - [x] 現スピーカーのみのハイライト
  - [ ] ChatAdminControl ここから以前を隠すフラグ
  - [ ] chat mod action
  - [x] isAdmin white 背景
  - [x] 自動リンク
- [ ] be: チャットログ回収
- [x] be: スケジュール情報の保存と発出 + IVS
- [x] 字幕考える
  - [x] 字幕きったときに他窓でも hide されないと混乱する
- [ ] control: cue
  - [ ] TrackCard
  - [ ] MediaLive スケジューリング
  - [ ] ChatSpotlight
  - [ ] be: タイムテーブル
- [x] IVSメタデータ発出
- [ ] トランジションのモーションどうするか
- [x] Interpret/Caption preference の保存
  - [ ] Interpret がない場合でもわざわざ stream の切り替えをする必要はないぞ
  - [ ] でも切り替えしたいことがあることがわかったので強制ストリーム変更をリクエストできる機能をつける…
- [ ] fe: ストリーム停止時の挙動 (playlist 404になる)
- [x] fe: ストリーム読み込み中のプレースホルダ
  - [x] video の minH
- [x] fe: asset を S3 に
- [ ] fe: ローディング画面
- [ ] CloudFront
- [ ] control: nav
- [x] control: Attendee の編集
- [x] control: TrackCard の作成と保存
  - [ ] かしこいエディタ
- [x] チャットで絵文字いれてもしなないようにする
- [ ] 言語フィルタ
- [ ] shoryuken
- [ ] 幕間画面
- [ ] next talks カード
- [ ] mobile view
- [ ] sponsor promo rotate
- [ ] periodic metadata republish 
  - [ ] ivs cards
  - [ ] chime pins
  - [ ] chime spotlights
- [x] fe: 裏番組の表示
- [ ] fe: 字幕 テキストエリアは width せまいほうがいいかも
- [ ] !attendee.is_ready で警告
- [ ] なんか TrackCardTopic のテキスト長で動画の width 変わるんですけど＞＜
- [ ] production
  - [ ] IVS
  - [ ] MediaLive
  - [ ] Chime
  - [ ] IAM

## Setup

IVS and Chime SDK for Messaging are uncovered by Terraform :/

### Chime SDK for Messaging

```sh
aws chime create-app-instance --name rk-takeout-dev
aws chime create-app-instance-user --app-instance-arn "arn:aws:chime:us-east-1:005216166247:app-instance/0e09042d-8e87-4b2f-a25b-d71a0e604443" --app-instance-user-id app --name app
aws chime create-app-instance-admin --app-instance-arn "arn:aws:chime:us-east-1:005216166247:app-instance/0e09042d-8e87-4b2f-a25b-d71a0e604443" --app-instance-admin-arn arn:aws:chime:us-east-1:005216166247:app-instance/0e09042d-8e87-4b2f-a25b-d71a0e604443/user/app
```

### IVS

### MediaLive

### caption/serve.rb

## License

MIT License (c) Sorah Fukumori 2021

- unless otherwise noted
  - e.g. `app/javascript/*Icon.tsx`
