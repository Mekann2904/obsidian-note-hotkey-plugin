# Note Hotkey Plugin

Obsidian 用のカスタムホットキーを設定できるプラグインです。  
特定のノートや Obsidian URI にホットキーを割り当てて、素早く開くことができます。

⚠ **このプラグインは、Obsidian のプラグインブラウザには登録されていません。**
`note-hotkey-plugin.zip` から手動でインストールしてください。

---

## 🚀 機能

- 任意の **ノートファイルをホットキーで開く**
- `obsidian://open?file=...` 形式の **URI にホットキーを割り当て**
- **Obsidian 標準の「Hotkeys」設定からショートカットを割り当て可能**
- **ファイル名の入力時に補完サジェストを表示**
- 設定画面でコマンドを追加・削除できる

---

## 🔧 インストール方法

### **1. ZIPファイルをダウンロード**
1. [GitHub Releases](https://github.com/YOUR_GITHUB_REPO/releases) にアクセス  
2. 最新のリリースページを開く  
3. `note-hotkey-plugin.zip` をダウンロード  

### **2. プラグインフォルダに配置**
1. `note-hotkey-plugin.zip` を解凍
2. 以下のフォルダに配置（存在しない場合は作成）
   ```
   <ObsidianVault>/.obsidian/plugins/note-hotkey-plugin/
   ```
3. 配置後のフォルダ構成:
   ```
   <ObsidianVault>/.obsidian/plugins/note-hotkey-plugin/
   ├── main.js
   ├── manifest.json
   ├── styles.css (存在する場合)
   ```

### **3. Obsidian でプラグインを有効化**
1. Obsidian の `Settings`（設定）を開く
2. `Community Plugins`（コミュニティプラグイン）を開く
3. `note-hotkey-plugin` を有効化

---

## 🎛️ 設定方法

1. **`Settings → Note Hotkey Plugin` を開く**
2. **ホットキーに登録するノートや URI を追加**
   - **ファイルモード:** ノートのパスを入力（補完サジェストあり）
   - **URIモード:** `obsidian://` で始まる URI を入力
3. **`Settings → Hotkeys` で割り当てる**
   - 追加したコマンドにキーバインドを設定
4. **ホットキーでノートを開く！**

---

## 🛠️ 使い方

1. **ノートを開くホットキーを設定**
   - `Settings → Note Hotkey Plugin` でノートのパスを登録
   - `Settings → Hotkeys` でホットキーを割り当て
2. **ホットキーを押すと即座にノートが開く**
3. **URIモードを使えば、特定のビューや Obsidian のコマンドを開くことも可能**
   - 例: `obsidian://open?file=MyNote`

---

## ❓ FAQ

### **Q. プラグインブラウザからインストールできますか？**
**いいえ、このプラグインは `note-hotkey-plugin.zip` からのみインストール可能です。**  
GitHub Releases から手動でダウンロード＆配置してください。

### **Q. ファイル名の補完機能はありますか？**
はい、ファイル名モードでは **Vault 内のノート名をサジェスト** する機能がついています。

### **Q. URIモードで何ができますか？**
Obsidian の **URIスキーム** (`obsidian://open?file=MyNote` など) をホットキーで開くことができます。

---

## 📜 ライセンス

MIT License


---
