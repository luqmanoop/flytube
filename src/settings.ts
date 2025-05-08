import { storage } from "./utils";

export const Settings = {
	allowBackgroundAds: "allow-background-ads",
	showComparisonSlider: "show-comparison-slider",
};

export const SettingsConfig = [
	{
		id: Settings.allowBackgroundAds,
		title: "Allow background ads",
		description:
			"Support creators by allowing ads to play in the background. You won't see ads, but creators will still get paid.",
	},
	{
		id: Settings.showComparisonSlider,
		title: "Show comparison slider",
		description:
			"Show a comparison slider between the current and previous video.",
	},
];

// biome-ignore lint/suspicious/noExplicitAny:
export const getSettings = async (): Promise<Record<string, any>> => {
	return storage.getAll(Object.values(Settings)).then((settings) => {
		if (!settings) throw new Error("No settings found");
		return settings;
	});
};
