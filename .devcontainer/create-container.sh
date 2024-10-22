#!/bin/sh
KEY_PATH=/home/vscode/.ssh
KEY_FILE=id_rsa
KEY_FILEPATH=$KEY_PATH/$KEY_FILE
mkdir -p $KEY_PATH
cat /key/.ssh/${KEY_FILE} > $KEY_FILEPATH
chmod 0600 $KEY_FILEPATH

GITCONFIG_PATH=/home/vscode
GITCONFIG_FILE=.gitconfig
GITCONFIG_FILEPATH=$GITCONFIG_PATH/$GITCONFIG_FILE
cat /key/$GITCONFIG_FILE > $GITCONFIG_FILEPATH
chmod 0644 $GITCONFIG_FILEPATH

# テスト用データベースのSQLite3をインストールする
sudo apt update
sudo apt upgrade -y
sudo apt install -y sqlite3

# PlantUMLのプレビューを表示するために必要なモジュール
# PlantUMLのプレビューで日本語を使用すると文字が重なる不具合を解消するため、日本語フォントをインストールする。
sudo apt install -y graphviz fonts-ipafont
fc-cache -fv
