import mitt from "mitt";

import { ComparisonSlider } from "./comparison-slider";
import { EmbeddedPlayer } from "./embedded-player";
import { Settings, getSettings } from "./settings";
import { Toast } from "./toast";
import {
	getCurrentVideoId,
	getVideoPlayerContainer,
	isShortsUrl,
	isVideoWatchPage,
	onClassChange,
} from "./utils";
import { YoutubePlayer } from "./youtube-player";

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

	emitter.on(Settings.removeAdSlots, (isEnabled) => {
		toggleAdSlots(currentUrl, Boolean(isEnabled));
	});

	const isWatchUrl = isVideoWatchPage(url);
	const videoId = getCurrentVideoId(url.href);

	let isEmbedError = false;
	let isEmbedErrorHandled = false;

	const videoPlayerContainer = await getVideoPlayerContainer();

	if (!isWatchUrl || !videoId || !videoPlayerContainer) return;

	const youtubeVideoPlayer = new YoutubePlayer(videoPlayerContainer);
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

	const checkEmbedErrorId = setInterval(() => {
		const flyTubeIframe = document.querySelector("iframe#flytube-player") as
			| HTMLIFrameElement
			| undefined;

		const embedError =
			flyTubeIframe?.contentWindow?.document.querySelector(".ytp-embed-error");

		if (flyTubeIframe && embedError) {
			isEmbedError = true;
			videoPlayerContainer.classList.add("flytube-error"); // trigger mutation observer
			clearInterval(checkEmbedErrorId);
		}
	}, 500);

	const disconnectObserver = onClassChange(videoPlayerContainer, async () => {
		const flyTubeIframe = document.querySelector("iframe#flytube-player") as
			| HTMLIFrameElement
			| undefined;

		const embedError =
			flyTubeIframe?.contentWindow?.document.querySelector(".ytp-embed-error");

		const flyTubeError =
			videoPlayerContainer.classList.contains("flytube-error");

		if (flyTubeIframe && (!embedError || !flyTubeError)) {
			// always mute underlying player when flytube is loaded. otherwise, if underlying player changes from ad to video or vice versa, mute state might not be updated correctly.
			youtubeVideoPlayer.mute();
		} else if (!isEmbedErrorHandled) {
			isEmbedError = true;
			isEmbedErrorHandled = true;
			youtubeVideoPlayer.pause();
			await Toast.show(
				videoPlayerContainer,
				"FlyTube failed to load",
				"The native YouTube player will now be used & you may see ads.",
			);
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
	Toast.cleanup();
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
