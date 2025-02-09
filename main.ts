import {
	App,
	Plugin,
	PluginSettingTab,
	Setting,
	TFile,
	Notice,
} from "obsidian";

/**
 * 各コマンドの設定項目
 */
interface MultiCommand {
	name: string;         // Hotkeys 画面に表示されるコマンド名
	useFileName: boolean; // true=ファイル名モード, false=URIモード
	fileOrUri: string;    // ファイルパスまたは Obsidian URI
}

/**
 * プラグイン全体の設定
 */
interface MultiUriHotkeySettings {
	commands: MultiCommand[];
}

/** デフォルト設定（最初は空） */
const DEFAULT_SETTINGS: MultiUriHotkeySettings = {
	commands: [],
};

export default class MultiUriHotkeyPlugin extends Plugin {
	settings: MultiUriHotkeySettings;

	async onload() {
		console.log("Loading MultiUriHotkeyPlugin with file suggest...");

		await this.loadSettings();
		this.registerAllCommands();

		// 設定タブを追加
		this.addSettingTab(new MultiUriHotkeySettingTab(this.app, this));
	}

	onunload() {
		console.log("Unloading MultiUriHotkeyPlugin...");
	}

	/**
	 * 設定を読み込み
	 */
	async loadSettings() {
		const data = await this.loadData();
		this.settings = Object.assign({}, DEFAULT_SETTINGS, data);
	}

	/**
	 * 設定を保存し、コマンドを再登録
	 */
	async saveSettings() {
		await this.saveData(this.settings);
		this.registerAllCommands();
	}

	/**
	 * コマンドをまとめて addCommand() し、Obsidian 標準 Hotkeys に対応
	 */
	private registerAllCommands() {
		this.settings.commands.forEach((cmd, index) => {
			const commandId = `multi-uri-hotkey-plugin-command-${index}`;
			this.addCommand({
				id: commandId,
				name: cmd.name,
				callback: () => {
					this.executeCommand(cmd);
				},
			});
		});
	}

	/**
	 * コマンド実行処理
	 */
	private async executeCommand(cmd: MultiCommand) {
		if (!cmd.useFileName) {
			// URIモード → window.open() で処理
			window.open(cmd.fileOrUri);
			return;
		}

		// ファイルモード → 通常タブで開く
		const filePath = cmd.fileOrUri.trim();
		const af = this.app.vault.getAbstractFileByPath(filePath);
		if (!af || !(af instanceof TFile)) {
			new Notice(`File not found: ${filePath}`);
			return;
		}
		this.app.workspace.openLinkText(filePath, "", false);
	}
}

/* ------------------------------------------------------------------
 * 設定タブ + ファイル名サジェスト機能
 * ------------------------------------------------------------------ */
class MultiUriHotkeySettingTab extends PluginSettingTab {
	plugin: MultiUriHotkeyPlugin;

	constructor(app: App, plugin: MultiUriHotkeyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl("h2", { text: "Multi URI/File Hotkey Settings" });

		containerEl.createEl("p", {
			text: "ここで追加したコマンドは、Obsidian標準の「Settings → Hotkeys」でショートカット割り当てができます。",
		});

		// Hotkeys 設定画面へ移動するボタン
		new Setting(containerEl)
			.setName("Open Hotkeys Setting")
			.setDesc("Hotkeys画面を開いてショートカットを割り当て")
			.addButton((btn) =>
				btn.setButtonText("Go").onClick(() => {
					(this.app as any).setting?.openTabById?.("hotkeys");
				})
			);

		containerEl.createEl("hr");

		// 既存コマンド一覧
		this.plugin.settings.commands.forEach((cmd, index) => {
			const s = new Setting(containerEl)
				.setName(`Command #${index + 1}`)
				.setDesc("Name / File or URI / Mode");

			// コマンド名
			s.addText((tc) =>
				tc
					.setPlaceholder("Command Name")
					.setValue(cmd.name)
					.onChange(async (val) => {
						cmd.name = val;
						await this.plugin.saveSettings();
					})
			);

			// ファイルモード or URIモード
			s.addToggle((tg) =>
				tg
					.setValue(cmd.useFileName)
					.setTooltip("ON=ファイル / OFF=URI")
					.onChange(async (val) => {
						cmd.useFileName = val;
						await this.plugin.saveSettings();
						this.display(); // 入力欄の切り替えを反映
					})
			);

			// ファイル名 or URI 入力欄
			if (cmd.useFileName) {
				// ファイル名モード → サジェスト付きインプットを使う
				this.addFileSuggestInput(s, cmd);
			} else {
				// URIモード → 通常のテキスト入力
				s.addText((tc) =>
					tc
						.setPlaceholder("obsidian://open?file=Example")
						.setValue(cmd.fileOrUri)
						.onChange(async (val) => {
							cmd.fileOrUri = val;
							await this.plugin.saveSettings();
						})
				);
			}

			// 削除ボタン
			s.addButton((btn) =>
				btn
					.setButtonText("Delete")
					.setCta()
					.onClick(async () => {
						this.plugin.settings.commands.splice(index, 1);
						await this.plugin.saveSettings();
						this.display();
					})
			);
		});

		// 新規コマンド追加ボタン
		new Setting(containerEl)
			.setName("Add New Command")
			.setDesc("新しいコマンドを追加")
			.addButton((btn) =>
				btn.setButtonText("Add").setCta().onClick(async () => {
					this.plugin.settings.commands.push({
						name: "New Command",
						useFileName: true,
						fileOrUri: "",
					});
					await this.plugin.saveSettings();
					this.display();
				})
			);
	}

	/**
	 * ファイル名サジェスト付きの入力を設定項目に追加
	 */
	private addFileSuggestInput(setting: Setting, cmd: MultiCommand) {
		// Setting.controlEl 内に input 要素を自分で作成
		const inputEl = setting.controlEl.createEl("input", {
			type: "text",
			value: cmd.fileOrUri,
		});
		inputEl.placeholder = "path/to/Note.md";

		// サジェスト用クラスを付与
		new FileSuggest(this.app, inputEl, async (newPath) => {
			cmd.fileOrUri = newPath;
			await this.plugin.saveSettings();
		});
	}
}

/* ------------------------------------------------------------------
 * ファイルサジェストクラス
 * ------------------------------------------------------------------ */
class FileSuggest {
	private app: App;
	private inputEl: HTMLInputElement;
	private suggestEl: HTMLUListElement;
	private onSelect: (val: string) => void;

	constructor(app: App, inputEl: HTMLInputElement, onSelect: (val: string) => void) {
		this.app = app;
		this.inputEl = inputEl;
		this.onSelect = onSelect;

		// サジェスト用UL
		this.suggestEl = document.createElement("ul");
		this.suggestEl.addClass("file-suggest-dropdown");
		this.suggestEl.style.position = "absolute";
		this.suggestEl.style.display = "none";
		this.suggestEl.style.zIndex = "9999";
		document.body.appendChild(this.suggestEl);

		// イベント登録
		this.inputEl.addEventListener("input", this.onInput.bind(this));
		this.inputEl.addEventListener("focus", this.onInput.bind(this));
		this.inputEl.addEventListener("blur", this.onBlur.bind(this));
	}

	/**
	 * 入力が変わったときに候補を更新
	 */
	private onInput() {
		const query = this.inputEl.value.trim().toLowerCase();
		if (!query) {
			this.hideSuggestions();
			return;
		}

		// Vault 内のファイルで、パスに query が含まれるものを上位20件
		const allFiles = this.app.vault.getFiles();
		const matched = allFiles
			.filter((f) => f.path.toLowerCase().includes(query))
			.slice(0, 20);

		if (matched.length === 0) {
			this.hideSuggestions();
			return;
		}

		// リスト生成
		this.suggestEl.innerHTML = "";
		matched.forEach((f) => {
			const li = this.suggestEl.createEl("li", { text: f.path });
			li.addEventListener("mousedown", (ev) => {
				ev.preventDefault();
				this.inputEl.value = f.path;
				this.onSelect(f.path);
				this.hideSuggestions();
			});
			this.suggestEl.appendChild(li);
		});

		// 位置とサイズを計算
		const rect = this.inputEl.getBoundingClientRect();
		this.suggestEl.style.top = `${rect.bottom + window.scrollY}px`;
		this.suggestEl.style.left = `${rect.left + window.scrollX}px`;
		this.suggestEl.style.width = `${rect.width}px`;
		this.suggestEl.style.display = "block";
	}

	private onBlur() {
		// マウスクリックが反映されるようにちょっと遅らせて非表示にする
		setTimeout(() => this.hideSuggestions(), 200);
	}

	private hideSuggestions() {
		this.suggestEl.style.display = "none";
	}
}
