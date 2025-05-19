import { storage } from "./utils";

export const Settings = {
	allowBackgroundAds: "allow-background-ads",
	showComparisonSlider: "show-comparison-slider",
	removeAdSlots: "remove-ad-slots",
};

export const SettingsConfig = [
	{
		id: Settings.allowBackgroundAds,
		title: "Allow background ads",
		description:
			"Support creators by allowing ads to play in the background without interrupting your watch experience.",
	},
	{
		id: Settings.removeAdSlots,
		title: "Remove ad slots",
		description: "Remove distracting ad slots & banners",
	},
	{
		id: Settings.showComparisonSlider,
		title: "Show comparison slider",
		description: "See a before-after slider for comparing playing video",
	},
];

export const getSettings = async (): Promise<Record<string, boolean>> => {
	return storage.getAll(Object.values(Settings)).then((settings) => {
		if (!settings) throw new Error("No settings found");
		return settings;
	});
};
