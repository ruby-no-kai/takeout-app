# README


## Todos

- [ ] navbar リンク・デザイン
- [x] attendee ログイン
  - [ ] デザイン
- [x] attendee 設定
  - [ ] デザイン
- [x] be: 複数トラックの設定
- [x] fe: IVS embed
- [x] fe: チャット
  - [ ] fe: チャットのオートスクロールもうすこし賢くする
  - [ ] デザイン
  - [ ] 現スピーカーのみのハイライト
  - [ ] ChatAdminControl ここから以前を隠すフラグ
  - [ ] chat mod action
- [ ] be: チャットログ回収
- [x] be: スケジュール情報の保存と発出 + IVS
- [ ] 字幕考える
- [ ] control: MediaLive スケジューリング
  - [ ] be: タイムテーブル
- [x] IVSメタデータ発出
- [ ] トランジションのモーションどうするか
- [x] Interpret/Caption preference の保存
  - [ ] Interpret がない場合でもわざわざ stream の切り替えをする必要はないぞ
- [ ] fe: ストリーム停止時の挙動 (playlist 404になる)
- [x] fe: ストリーム読み込み中のプレースホルダ
  - [x] video の minH
- [x] fe: asset を S3 に
- [ ] fe: ローディング画面
- [ ] CloudFront
- [ ] control: Attendee の編集
- [x] control: TrackCard の作成と保存
  - [ ] かしこいエディタ
- [ ] チャットで絵文字いれてもしなないようにする
- [ ] 言語フィルタ
- [ ] shoryuken
- [ ] 幕間画面
- [ ] next talks カード
- [ ] mobile view
- [ ] sponsor promo rotate
- [ ] periodic metadata republish 
- [ ] fe: 裏番組の表示

## Setup

IVS and Chime SDK for Messaging are uncovered by Terraform :/

### Chime SDK for Messaging

```sh
aws chime create-app-instance --name rk-takeout-dev
aws chime create-app-instance-user --app-instance-arn "arn:aws:chime:us-east-1:005216166247:app-instance/0e09042d-8e87-4b2f-a25b-d71a0e604443" --app-instance-user-id app --name app
aws chime create-app-instance-admin --app-instance-arn "arn:aws:chime:us-east-1:005216166247:app-instance/0e09042d-8e87-4b2f-a25b-d71a0e604443" --app-instance-admin-arn arn:aws:chime:us-east-1:005216166247:app-instance/0e09042d-8e87-4b2f-a25b-d71a0e604443/user/app
```

## License

MIT License (c) Sorah Fukumori 2021

(unless otherwise noted)
