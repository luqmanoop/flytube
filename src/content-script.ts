import mitt from "mitt";

import { EmbeddedPlayer, YoutubeVideoPlayer } from ".";
import { ComparisonSlider } from "./comparison-slider";
import { Settings, getSettings } from "./settings";
import {
	getCurrentVideoId,
	getVideoPlayerContainer,
	isShortsUrl,
	isVideoWatchPage,
	onClassChange,
} from "./utils";

const emitter = mitt();

const style = document.createElement("style");
style.innerHTML = `
	ytd-ad-slot-renderer,
	ytd-engagement-panel-section-list-renderer,
	ytd-companion-slot-renderer,
	ytd-player-legacy-desktop-watch-ads-renderer,
	.ytd-ads-engagement-panel-content-renderer,
	.ytd-engagement-panel-section-list-renderer,
	.ytd-companion-slot-renderer,
	.ytd-player-legacy-desktop-watch-ads-renderer,
	#masthead-ad,
	ytd-banner-promo-renderer,
	#mealbar-promo-renderer {
		display: none !important;
	}
`;

const toggleAdSlots = async (url: URL, enabled: boolean) => {
	if (enabled && !isShortsUrl(url)) {
		document.head.appendChild(style);
	} else {
		style.remove();
	}
};

let currentUrl: URL = new URL(location.href);

const initialize = async (url = currentUrl) => {
	const settings = await getSettings();

	toggleAdSlots(url, settings[Settings.removeAdSlots]);

	const isWatchUrl = isVideoWatchPage(url);
	const videoId = getCurrentVideoId(url.href);

	let isEmbedError = false;

	const videoPlayerContainer = await getVideoPlayerContainer();

	if (!isWatchUrl || !videoId || !videoPlayerContainer) return;

	const youtubeVideoPlayer = new YoutubeVideoPlayer(videoPlayerContainer);
	const embeddedVideoPlayer = new EmbeddedPlayer(videoId);

	youtubeVideoPlayer.mute();

	if (settings[Settings.allowBackgroundAds]) {
		youtubeVideoPlayer.play();
	} else {
		youtubeVideoPlayer.pause();
	}

	if (settings[Settings.showComparisonSlider]) {
		ComparisonSlider.init(videoPlayerContainer);
	}

	emitter.on(Settings.removeAdSlots, (isEnabled) => {
		toggleAdSlots(currentUrl, Boolean(isEnabled));
	});

	emitter.on(Settings.allowBackgroundAds, (isEnabled) => {
		if (isEmbedError) return;

		return isEnabled ? youtubeVideoPlayer.play() : youtubeVideoPlayer.pause();
	});

	emitter.on(Settings.showComparisonSlider, (isEnabled) => {
		if (isEmbedError) return;

		return isEnabled
			? ComparisonSlider.init(videoPlayerContainer)
			: ComparisonSlider.destroy();
	});

	const handlePlayStateChange = async (isPlaying: boolean) => {
		if (isEmbedError) return;

		const settings = await getSettings();

		if (isPlaying && settings[Settings.allowBackgroundAds]) {
			youtubeVideoPlayer.play();
		} else {
			youtubeVideoPlayer.pause();
		}
	};

	embeddedVideoPlayer.onPlayStateChange(handlePlayStateChange);

	const disconnectObserver = onClassChange(videoPlayerContainer, async () => {
		const flyTubeIframe = document.querySelector("iframe#flytube-player") as
			| HTMLIFrameElement
			| undefined;

		const embedError =
			flyTubeIframe?.contentWindow?.document.querySelector(".ytp-embed-error");

		if (flyTubeIframe && !embedError) {
			youtubeVideoPlayer.mute();
		} else {
			isEmbedError = true;
			youtubeVideoPlayer.unmute();
			youtubeVideoPlayer.play();
			disconnectObserver();
			cleanup();
		}
	});

	youtubeVideoPlayer.mount(embeddedVideoPlayer.iframeElement);
};

const cleanup = () => {
	document.querySelector("iframe#flytube-player")?.remove();
	ComparisonSlider.destroy();
};

window.navigation.addEventListener("navigate", ({ destination: { url } }) => {
	if (url !== currentUrl.href) {
		currentUrl = new URL(url);
		cleanup();
		initialize(currentUrl);
	}
});

window.addEventListener("beforeunload", cleanup);

chrome.storage.onChanged.addListener((changes) => {
	for (const [key, { newValue }] of Object.entries(changes)) {
		emitter.emit(key, newValue);
	}
});

(async () => {
	try {
		await initialize();
	} catch (error) {
		cleanup();
	}
})();
