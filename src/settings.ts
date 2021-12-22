import {App, ButtonComponent, PluginSettingTab, Setting} from "obsidian";
import FaviconPlugin from "./main";
import {providers} from "./provider";
import {OverwrittenIconModal} from "./OverwrittenIconModal";
import {getApi, isPluginEnabled} from "@aidenlx/obsidian-icon-shortcodes";

export interface OverwrittenFavicon {
	domain: string,
	icon: string,
}

export interface FaviconPluginSettings {
	provider: string;
	fallbackProvider: string;
	providerDomain: string;
	fallbackProviderDomain: string;
	ignored: string;
	overwritten: OverwrittenFavicon[];
	protocol: OverwrittenFavicon[];
}

export const DEFAULT_SETTINGS: FaviconPluginSettings = {
	provider: 'duckduckgo',
	fallbackProvider: 'google',
	providerDomain: '',
	fallbackProviderDomain: '',
	ignored: '',
	overwritten: [],
	protocol: []
}

export class FaviconSettings extends PluginSettingTab {
	plugin: FaviconPlugin;

	constructor(app: App, plugin: FaviconPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Link Favicons'});

		new Setting(containerEl)
			.setName("Icon Provider")
			.addDropdown((dropdown) => {
				for(const id in providers) {
					if(providers.hasOwnProperty(id)) {
						dropdown.addOption(id, providers[id].name);
					}
				}
				dropdown
					.setValue(this.plugin.settings.provider)
					.onChange(async (value) => {
						this.plugin.settings.provider = value;
						await this.plugin.saveSettings();
						this.display();
					})
			});

		if (Array.of("besticon").includes(this.plugin.settings.provider)) {
			new Setting(containerEl)
				.setName('Provider Domain')
				.setDesc('This Provider is selfhosted, please specify your deployment url. Refer to the readme of the provider for deployment instructions.')
				.addText(text => text
					.setValue(this.plugin.settings.providerDomain)
					.onChange(async (value) => {
						this.plugin.settings.providerDomain = value;
						await this.plugin.saveSettings();
					}));
		}

		new Setting(containerEl)
			.setName("Fallback Icon Provider")
			.addDropdown((dropdown) => {
				for(const id in providers) {
					if(providers.hasOwnProperty(id)) {
						dropdown.addOption(id, providers[id].name);
					}
				}
				dropdown
					.setValue(this.plugin.settings.fallbackProvider)
					.onChange(async (value) => {
						this.plugin.settings.fallbackProvider = value;
						await this.plugin.saveSettings();
						this.display();
					})
			});

		if (Array.of("besticon").includes(this.plugin.settings.fallbackProvider)) {
			new Setting(containerEl)
				.setName('Fallback Provider Domain')
				.setDesc('This Provider is be selfhosted, please specify your deployment url. Refer to the readme of the provider for deployment instructions.')
				.addText(text => text
					.setValue(this.plugin.settings.fallbackProviderDomain)
					.onChange(async (value) => {
						this.plugin.settings.fallbackProviderDomain = value;
						await this.plugin.saveSettings();
					}));
		}


		new Setting(containerEl)
			.setName('Ignored Domains')
			.setDesc("Don't show an favicon for these domains(one per line)")
			.addTextArea(text => {
					text
						.setValue(this.plugin.settings.ignored)
						.onChange(async (value) => {
							this.plugin.settings.ignored = value;
							await this.plugin.saveSettings();
						})
					text.inputEl.setAttr("rows", 8);
				}
			);

		if(isPluginEnabled(this.plugin)) {
			containerEl.createEl("h2", {text: "Custom icons"});

			containerEl.createEl("h3", {text: "for Domains"});

			new Setting(containerEl)
				.setName("Add New")
				.setDesc("Add custom icon")
				.addButton((button: ButtonComponent): ButtonComponent => {
					return button
						.setTooltip("add custom icon")
						.setIcon("plus-with-circle")
						.onClick(async () => {
							const modal = new OverwrittenIconModal(this.plugin);

							modal.onClose = async () => {
								if (modal.saved) {
									this.plugin.settings.overwritten.push({
										domain: modal.domain,
										icon: modal.icon
									});
									await this.plugin.saveSettings();

									this.display();
								}
							};

							modal.open();
						});
				});


			const overwrittenContainer = containerEl.createDiv("overwritten");

			const overwrittenDiv = overwrittenContainer.createDiv("overwritten");
			for (const overwritten of this.plugin.settings.overwritten) {
				const setting = new Setting(overwrittenDiv);

				const iconAPI = getApi(this.plugin);

				const desc = new DocumentFragment();
				desc.createEl("p", {text: "		" + overwritten.icon}).prepend(iconAPI.getIcon(overwritten.icon));

				setting
					.setName(overwritten.domain)
					.setDesc(desc)
					.addExtraButton((b) => {
						b.setIcon("pencil")
							.setTooltip("Edit")
							.onClick(() => {
								const modal = new OverwrittenIconModal(this.plugin, overwritten);

								modal.onClose = async () => {
									if (modal.saved) {
										const setting = this.plugin.settings.overwritten.filter((overwritten) => {
											return overwritten.domain !== modal.domain;
										})
										setting.push({domain: modal.domain, icon: modal.icon});
										this.plugin.settings.overwritten = setting;
										await this.plugin.saveSettings();

										this.display();
									}
								};

								modal.open();
							});
					})
					.addExtraButton((b) => {
						b.setIcon("trash")
							.setTooltip("Delete")
							.onClick(async () => {

								this.display();
							});
					});


			}



			containerEl.createEl("h3", {text: "for Protocols"});

			new Setting(containerEl)
				.setName("Add New")
				.setDesc("Add custom icon")
				.addButton((button: ButtonComponent): ButtonComponent => {
					return button
						.setTooltip("add custom icon")
						.setIcon("plus-with-circle")
						.onClick(async () => {
							const modal = new OverwrittenIconModal(this.plugin, null, "Protocol");

							modal.onClose = async () => {
								if (modal.saved) {
									this.plugin.settings.protocol.push({
										domain: modal.domain,
										icon: modal.icon
									});
									await this.plugin.saveSettings();

									this.display();
								}
							};

							modal.open();
						});
				});


			const protocolContainer = containerEl.createDiv("overwritten");

			const voicesDiv = protocolContainer.createDiv("overwritten");
			for (const protocol of this.plugin.settings.protocol) {
				const setting = new Setting(voicesDiv);

				const iconAPI = getApi(this.plugin);

				const desc = new DocumentFragment();
				desc.createEl("p", {text: "		" + protocol.icon}).prepend(iconAPI.getIcon(protocol.icon));

				setting
					.setName(protocol.domain)
					.setDesc(desc)
					.addExtraButton((b) => {
						b.setIcon("pencil")
							.setTooltip("Edit")
							.onClick(() => {
								const modal = new OverwrittenIconModal(this.plugin, protocol, "Protocol");

								modal.onClose = async () => {
									if (modal.saved) {
										const setting = this.plugin.settings.protocol.filter((overwritten) => {
											return overwritten.domain !== modal.domain;
										})
										setting.push({domain: modal.domain, icon: modal.icon});
										this.plugin.settings.protocol = setting;
										await this.plugin.saveSettings();
										this.display();
									}
								};

								modal.open();
							});
					})
					.addExtraButton((b) => {
						b.setIcon("trash")
							.setTooltip("Delete")
							.onClick(async () => {
								this.plugin.settings.protocol = this.plugin.settings.protocol.filter((overwritten) => {
									return overwritten.domain !== protocol.domain;
								});
								await this.plugin.saveSettings();
								this.display();
							});
					});


			}
		}
	}
}
