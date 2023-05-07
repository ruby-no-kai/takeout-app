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
  - [x] ChatAdminControl ここから以前を隠すフラグ
  - [ ] __IMPORTANT__ chat mod action
    - [x] delete
    - [x] lookup
    - [ ] ban 
  - [x] isAdmin white 背景
  - [x] 自動リンク
- [ ] be: チャットログ回収
- [x] be: スケジュール情報の保存と発出 + IVS
- [x] 字幕考える
  - [x] 字幕きったときに他窓でも hide されないと混乱する
- [ ] __IMPORTANT__ control: cue
  - [ ] TrackCard
  - [ ] MediaLive スケジューリング
  - [ ] ChatSpotlight
  - [ ] be: タイムテーブル
- [x] IVSメタデータ発出
- [ ] トランジションのモーションどうするか
- [x] Interpret/Caption preference の保存
  - [x] Interpret がない場合でもわざわざ stream の切り替えをする必要はないぞ
  - [x] でも切り替えしたいことがあることがわかったので強制ストリーム変更をリクエストできる機能をつける…
- [ ] fe: ストリーム停止時の挙動 (playlist 404になる)
- [x] fe: ストリーム読み込み中のプレースホルダ
  - [x] video の minH
- [x] fe: asset を S3 に
- [ ] fe: ローディング画面
- [ ] control: nav
- [x] control: Attendee の編集
- [x] control: TrackCard の作成と保存
  - [ ] かしこいエディタ
- [x] チャットで絵文字いれてもしなないようにする
- [ ] 言語フィルタ
- [x] shoryuken
- [ ] __IMPORTANT__ 幕間画面
  - [ ] next talks カード
- [x] mobile view
- [ ] __IMPORTANT__ sponsor promo rotate
- [ ] __IMPORTANT__ periodic metadata republish 
  - [ ] ivs cards
  - [ ] chime pins
  - [ ] chime spotlights
- [x] fe: 裏番組の表示
- [ ] fe: 字幕 テキストエリアは width せまいほうがいいかも
- [x] !attendee.is_ready で警告
- [ ] production
  - [x] CloudFront
  - [x] IVS
  - [ ] MediaLive
  - [x] Chime
  - [x] IAM
- [x] __IMPORTANT__ stream presence まきもどっちゃう
- [x] Switch にもツールチップ
- [x] 音量おぼえてほしい
- [x] たぶがりんくであってほしい
- [x] autofocus やっぱモバイルでうっとおしい
- [x] deleteChannelMembership も自分じゃできないらしい
- [x] send ボタンが attendee でずれる
- [ ] offline でもうかたほうにリダイレクトしたい
- [ ] __IMPORTANT__ なんか chat session expiry の判定あやしいかも
- [ ] 幕間 hls pull のディレイへらす

## Development

## AWS Setup

IVS and Chime SDK for Messaging are uncovered by Terraform :/

### Chime SDK for Messaging

```sh
aws chime create-app-instance --name rk-takeout-...
```

And write app instance ARN down to conference jsonnet. Then run

```
rake takeout:ensure_chime
```

and it'll output channel and user ARNs for conference jsonnet.

### IVS

See ./tf/ivs.tf

### MediaLive

See ./tf/medialive.tf. Managed through CFn on Terraform.

### caption/serve.rb

## Data management

### ConferenceSponsorship

```
ruby misc/generate_conference_sponsorships_data.rb /tmp/RubyKaigi\ 2022_\ Sponsor\ Live\ Promo\ Text\ \(Responses\)\ -\ Form\ Responses\ 1.csv /tmp/sponsors.yml > ~/Downloads/sponsors.json
ruby misc/upload_conference_sponsorships_avatar.rb rk-takeout-app prd/avatars/ < ~/Downloads/sponsors.json
aws s3 cp ~/Downloads/sponsors.json s3://rk-takeout-app/prd/tmp/sponsors.json
rails runner 'p ConferenceSponsorship.delete_all'
rake takeout:import_sponsorships
```

### ConferenceSpeaker, ConferencePresentation


```
rake takeout:sync_conference_data
```

## Deploy

- AWS us-west-2 ([access instruction](https://rubykaigi.esa.io/posts/813))
- ECS with Hako, [./deploy/hako](./deploy/hako)

Deployments are automated with GitHub Actions.

## License

MIT License (c) Sorah Fukumori 2021

- unless otherwise noted
  - e.g. `app/javascript/*Icon.tsx`

