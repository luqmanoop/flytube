import elementReady, { type Options } from "element-ready";

declare global {
	interface Window {
		navigation: {
			addEventListener: (
				type: string,
				callback: (event: { destination: { url: string } }) => void,
			) => void;
		};
	}
}

export function $<T extends Element>(selector: string) {
	return document.querySelector<T>(selector);
}

export function $$<T extends Element>(selector: string) {
	return document.querySelectorAll<T>(selector);
}

export const waitFor = async (duration = 1000) =>
	new Promise((resolve) => setTimeout(resolve, duration));

export const waitForElement = async (selector: string, options?: Options) => {
	return elementReady(selector, {
		stopOnDomReady: false,
		...options,
	});
};

export const getCurrentTab = async () => {
	const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
	return tab;
};

/**
 * convenient method for chrome.storage
 */
export const storage = {
	set: async (key: string, value: unknown) => {
		return chrome.storage.sync
			.set({ [key]: value })
			.then(() => value)
			.catch(console.log);
	},
	get: async (key: string) => {
		return chrome.storage.sync
			.get(key)
			.then((result) => result[key])
			.catch(console.log);
	},
};

export const getPageUrl = (url: string) => new URL(url);

export const getCurrentVideoId = (url: string) =>
	getPageUrl(url).searchParams.get("v");

export const isVideoWatchPage = (url: URL) =>
	/\/watch/.test(url.pathname) && Boolean(url.searchParams.get("v"));

export const getVideoPlayerContainer = async () =>
	waitForElement("#movie_player.html5-video-player");
