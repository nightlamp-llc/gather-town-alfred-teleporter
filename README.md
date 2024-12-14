# gather-town-alfred-teleporter

## このコードは何？

[Alfred ※フリープラン可](https://www.alfredapp.com/) 用いて [Gather Town](https://ja.gather.town/) 上でプレイヤーや登録した場所の名前を使ってその人のいる場所やその場所へテレポートすることができるようになります。

## 前提・開発時の環境

Alfred がインストールされ起動している前提です。
手軽に使えるように `.node_versions` などは置いてません。(今どきのバージョンなら多分動く)

```zsh
> sw_vers
ProductName:            macOS
ProductVersion:         15.0

> node -v
v20.11.1

> npm -v
10.2.4
```

## 初回セットアップ

```zsh
# [1/4] クローン
gh clone nightlamp-llc/gather-town-alfred && pushd ./gather-town-alfred

# [2/4] env ファイルをコピー 2/4
cp example.env .env

# [3/4] env ファイルを編集し Gather Town のトークンなどを設定
# ※ [FYI] トークンの取得用 URL は example.env に記載あり
vim .env

# [4/4] setup (npm install から オンライン中の全プレイヤーID取得まで　)
# ※ [FYI] オンラインのプレイヤーが増えたら再度セットアップを実行しても問題はございません
# ※ デフォルトではホームディレクトリの Documents フォルダ下に gt という名前のフォルダとその内部にテレポート用のシェルスクリプトファイルが作成されます。
npm run setup

# [optional]
# 任意のパスを指定してフォルダを作成することも可能です。
npm run setup ~/Downloads/gather/
```

## 使い方

### テレポート

1. Alfred をショートカット(`⌥` `␣`)などで呼び出す
2. `open gt-{プレイヤー名や登録した場所の名前}` を入力
    - ※プレイヤー名や登録した場所の名前を全て入力する必要はなくサジェストされたらそれを選べば OK
3. サジェストされたものを `↑` `↓` キーで選び `Return`

以上で上手くいけば対象の場所へテレポートができます。(上手くいけば)

#### トラブルシューティング

- テレポート用のシェルスクリプトファイルがターミナル以外のソフトウェアで開く場合があります。
- Finder などからデフォルトのソフトウェア設定を見直してください🙏
- [手順] ファイルを選択 → "情報を見る"を押す → "このアプリケーションで開く"からアプリケーションを選択 → "すべてを変更"を押す
- Gather Town のソケット API へ接続していろいろ取得してからテレポートできるので直ぐ近くの人のところへ移動する場合は手動でアバターを動かした方が早いかも 🙏

### 名前をつけて場所を登録

MapId とマップ上の座標(X,Y)が記録されたファイルが作成されます。

```zsh
# 例1
npm run save my-desk

# 例2
npm run save meeting-room

# [optional]
# 任意のパスをすることも可能です。
npm run save my-desk ~/Downloads/gather/

# ※デフォルトではホームディレクトリの Documents フォルダ下に gt という名前のフォルダとその内部にテレポート用のシェルスクリプトファイルが作成されます。
```
