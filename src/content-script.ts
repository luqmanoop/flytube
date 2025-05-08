import { EmbeddedPlayer, YoutubeVideoPlayer } from ".";
import { ComparisonSlider } from "./comparison-slider";
import { Settings, getSettings } from "./settings";
import {
	getCurrentVideoId,
	getVideoPlayerContainer,
	isVideoWatchPage,
} from "./utils";

let currentUrl: URL = new URL(location.href);
let runningIntervalId: Timer | undefined;

let isBackgroundAdsEnabled: boolean;
let isComparisonSliderEnabled: boolean;

let embeddedVideoPlayer: EmbeddedPlayer;
let youtubeVideoPlayer: YoutubeVideoPlayer;

const initialize = async (url = currentUrl) => {
	try {
		embeddedVideoPlayer?.destroy();

		const isWatchUrl = isVideoWatchPage(url);
		const videoId = getCurrentVideoId(url.href);

		const videoPlayerContainer = await getVideoPlayerContainer();

		if (!isWatchUrl || !videoId || !videoPlayerContainer) return;

		if (runningIntervalId) {
			clearInterval(runningIntervalId);
		}

		youtubeVideoPlayer = new YoutubeVideoPlayer(videoPlayerContainer);
		embeddedVideoPlayer = new EmbeddedPlayer(videoId);

		if (!embeddedVideoPlayer.iframeElement) {
			console.error("Embedded player was not initialized");
			return;
		}

		youtubeVideoPlayer.mount(embeddedVideoPlayer.iframeElement);

		const settings = await getSettings();
		isBackgroundAdsEnabled = settings[Settings.allowBackgroundAds];
		isComparisonSliderEnabled = settings[Settings.showComparisonSlider];

		runningIntervalId = setInterval(() => {
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
		}, 500);

		embeddedVideoPlayer.onFailedToLoad(() => {
			embeddedVideoPlayer?.destroy();

			clearInterval(runningIntervalId);

			youtubeVideoPlayer?.setIsAllowedToPlay(true);
			youtubeVideoPlayer?.unmute();
			youtubeVideoPlayer?.play();
		});
	} catch (error) {
		console.error(error);
	}
};

initialize();

window.navigation.addEventListener("navigate", ({ destination: { url } }) => {
	if (url !== currentUrl.href) {
		currentUrl = new URL(url);
		initialize(currentUrl);
	}
});

// cleanup
window.addEventListener("beforeunload", () => {
	clearInterval(runningIntervalId);
	embeddedVideoPlayer?.destroy();
	ComparisonSlider.destroy();
});

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
		}
	}
});
