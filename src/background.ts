import { Settings, storage } from "./utils";

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
});
