import { EmbeddedPlayer, YoutubeVideoPlayer } from ".";
import { ComparisonSlider } from "./comparison-slider";
import { Settings, getSettings } from "./settings";
import {
	getCurrentVideoId,
	getVideoPlayerContainer,
	isShortsUrl,
	isVideoWatchPage,
} from "./utils";

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
		display: none;
	}
`;

const toggleAdSlots = async (url: URL) => {
	const settings = await getSettings();
	if (settings[Settings.removeAdSlots] && !isShortsUrl(url)) {
		document.head.appendChild(style);
	} else {
		style.remove();
	}
};

try {
	let currentUrl: URL = new URL(location.href);
	let runningIntervalId: Timer | undefined;

	let isBackgroundAdsEnabled: boolean;
	let isComparisonSliderEnabled: boolean;

	let embeddedVideoPlayer: EmbeddedPlayer | null;
	let youtubeVideoPlayer: YoutubeVideoPlayer;

	const updateSettings = async () => {
		const settings = await getSettings();
		isBackgroundAdsEnabled = settings[Settings.allowBackgroundAds];
		isComparisonSliderEnabled = settings[Settings.showComparisonSlider];
	};

	const initialize = async (url = currentUrl) => {
		try {
			await updateSettings();

			toggleAdSlots(url);

			const isWatchUrl = isVideoWatchPage(url);
			const videoId = getCurrentVideoId(url.href);

			const videoPlayerContainer = await getVideoPlayerContainer();

			if (!isWatchUrl || !videoId || !videoPlayerContainer) return;

			youtubeVideoPlayer = new YoutubeVideoPlayer(videoPlayerContainer);
			embeddedVideoPlayer = new EmbeddedPlayer(videoId);

			if (!embeddedVideoPlayer.iframeElement) {
				console.error("Embedded player was not initialized");
				return;
			}

			youtubeVideoPlayer.mount(embeddedVideoPlayer.iframeElement);

			runningIntervalId = setInterval(() => {
				if (!embeddedVideoPlayer) return;

				if (
					youtubeVideoPlayer.isAllowedToMovePlayhead &&
					youtubeVideoPlayer.currentTime !== embeddedVideoPlayer.currentTime &&
					(!embeddedVideoPlayer.isFinishedPlaying ||
						!embeddedVideoPlayer.isPaused)
				) {
					youtubeVideoPlayer.currentTime = embeddedVideoPlayer.currentTime;
				}

				if (isComparisonSliderEnabled) {
					ComparisonSlider.init(videoPlayerContainer);
				}

				if (!youtubeVideoPlayer.allowedToPlay) {
					youtubeVideoPlayer.mute();
				}

				if (isBackgroundAdsEnabled && !embeddedVideoPlayer.isPaused) {
					youtubeVideoPlayer.play();
				}

				if (
					embeddedVideoPlayer.isFinishedPlaying ||
					embeddedVideoPlayer.isPaused ||
					!isBackgroundAdsEnabled
				) {
					youtubeVideoPlayer.pause();
				}
			}, 500); // half a second is crucial to not negatively impact video retention when moving playhead

			embeddedVideoPlayer.onFailedToLoad(() => {
				embeddedVideoPlayer?.destroy();
				embeddedVideoPlayer = null;

				clearInterval(runningIntervalId);

				youtubeVideoPlayer?.setIsAllowedToPlay(true);
				youtubeVideoPlayer?.unmute();
				youtubeVideoPlayer?.play();
			});
		} catch (error) {
			console.error(error);
		}
	};

	const cleanup = () => {
		embeddedVideoPlayer?.destroy();
		if (runningIntervalId) {
			clearInterval(runningIntervalId);
		}
		ComparisonSlider.destroy();
	};

	initialize();

	window.document.addEventListener("visibilitychange", async () => {
		if (document.visibilityState === "visible") {
			await updateSettings();
			await toggleAdSlots(currentUrl);
		}
	});

	window.navigation.addEventListener("navigate", ({ destination: { url } }) => {
		if (url !== currentUrl.href) {
			currentUrl = new URL(url);
			cleanup();
			initialize(currentUrl);
		}
	});

	window.addEventListener("beforeunload", cleanup);

	chrome.storage.onChanged.addListener((changes) => {
		for (const [key, { oldValue, newValue }] of Object.entries(changes)) {
			switch (key) {
				case Settings.allowBackgroundAds:
					isBackgroundAdsEnabled = newValue;
					break;
				case Settings.showComparisonSlider:
					isComparisonSliderEnabled = newValue;
					if (!isComparisonSliderEnabled) {
						ComparisonSlider.destroy();
					}
					break;
				case Settings.removeAdSlots:
					toggleAdSlots(currentUrl);
					break;
			}
		}
	});
} catch (error) {
	console.error(error);
	if (chrome.runtime.lastError) {
		console.error(chrome.runtime.lastError);
	}
}
