# README

## Todos

- [ ] navbar リンク・デザイン
- [x] attendee ログイン
  - [ ] デザイン
- [x] attendee 設定
  - [ ] デザイン
- [ ] be: 複数トラックの設定
- [ ] be: タイムテーブル
- [x] fe: IVS embed
- [ ] fe: チャット
- [ ] be: チャットログ回収
- [ ] be: スケジュール情報の保存と発出 + IVS
- [ ] 字幕考える
- [ ] MediaLive スケジューリング
- [ ] IVSメタデータ発出
- [ ] トランジションのモーションどうするか
- [x] Interpret/Caption preference の保存
  - [ ] Interpret がない場合でもわざわざ stream の切り替えをする必要はないぞ
- [ ] fe: ストリーム停止時の挙動 (playlist 404になる)
- [ ] fe: ストリーム読み込み中のプレースホルダ

## Setup

IVS and Chime SDK for Messaging are uncovered by Terraform :/

### Chime SDK for Messaging

```sh
aws chime create-app-instance --name rk-takeout-dev
aws chime create-app-instance-user --app-instance-arn "arn:aws:chime:us-east-1:005216166247:app-instance/0e09042d-8e87-4b2f-a25b-d71a0e604443" --app-instance-user-id app --name app
aws chime create-app-instance-admin --app-instance-arn "arn:aws:chime:us-east-1:005216166247:app-instance/0e09042d-8e87-4b2f-a25b-d71a0e604443" --app-instance-admin-arn arn:aws:chime:us-east-1:005216166247:app-instance/0e09042d-8e87-4b2f-a25b-d71a0e604443/user/app
```
