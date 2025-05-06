import { MESSAGE_TYPES, storage } from "./utils";

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
	if (reason === chrome.runtime.OnInstalledReason.INSTALL) {
		const isBackgroundAdsEnabled = await storage.get(
			MESSAGE_TYPES.ALLOW_BACKGROUND_ADS,
		);

		if (isBackgroundAdsEnabled === undefined) {
			await storage.set(MESSAGE_TYPES.ALLOW_BACKGROUND_ADS, true);
		}
	}
});
