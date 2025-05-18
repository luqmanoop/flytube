import { Settings, SettingsConfig } from "./settings";
import { storage } from "./utils";

chrome.alarms.create("keepAlive", {
	periodInMinutes: 0.5, // 30 seconds
});

chrome.alarms.onAlarm.addListener((alarm) => {
	console.log(`sw::${alarm.name}`);
});

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
	if (reason === chrome.runtime.OnInstalledReason.INSTALL) {
		const isBackgroundAdsEnabled = await storage.get(
			Settings.allowBackgroundAds,
		);

		if (isBackgroundAdsEnabled === undefined) {
			await storage.set(Settings.allowBackgroundAds, true);
		}
	}

	chrome.action.disable();

	chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
		const rules = [
			{
				conditions: [
					new chrome.declarativeContent.PageStateMatcher({
						pageUrl: {
							hostSuffix: ".youtube.com",
							schemes: ["https"],
						},
					}),
				],
				actions: [new chrome.declarativeContent.ShowPageAction()],
			},
		];
		chrome.declarativeContent.onPageChanged.addRules(rules);
	});

	// add settings to context menu
	for (const { id, title } of SettingsConfig) {
		const isEnabled = await storage.get(id);

		chrome.contextMenus.create({
			id,
			title,
			checked: isEnabled,
			type: "checkbox",
			documentUrlPatterns: ["https://www.youtube.com/*"],
		});
	}

	// update settings when context menu item is clicked
	chrome.contextMenus.onClicked.addListener(async (selected) => {
		const selectedItemId = selected.menuItemId as string;
		const settings = Object.values(Settings);
		if (settings.includes(selectedItemId)) {
			await storage.set(selectedItemId, selected.checked);
		}
	});

	// update context menu item when setting is changed
	chrome.storage.onChanged.addListener((changes) => {
		for (const [key, { oldValue, newValue }] of Object.entries(changes)) {
			chrome.contextMenus.update(key, {
				checked: !!newValue,
			});
		}
	});
});
