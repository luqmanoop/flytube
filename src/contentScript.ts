import { EmbeddedPlayer, YtVideoPlayer } from ".";
import {
	getCurrentVideoId,
	getVideoPlayerContainer,
	isVideoWatchPage,
} from "./utils";

let currentUrl: URL = new URL(location.href);
let runningIntervalId: Timer | undefined;

let embeddedVideoPlayer: EmbeddedPlayer;
let youtubeVideoPlayer: YtVideoPlayer;

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

		youtubeVideoPlayer = new YtVideoPlayer(videoPlayerContainer);
		embeddedVideoPlayer = new EmbeddedPlayer(videoId);

		if (!embeddedVideoPlayer.iframeElement) {
			console.error("Embedded player was not initialized");
			return;
		}

		youtubeVideoPlayer.mount(embeddedVideoPlayer.iframeElement);

		runningIntervalId = setInterval(() => {
			if (!youtubeVideoPlayer.allowedToPlay && !youtubeVideoPlayer.isMuted) {
				youtubeVideoPlayer.mute();
			}

			if (
				embeddedVideoPlayer.isFinishedPlaying ||
				embeddedVideoPlayer.currentTime > 10 // don't spook youtube too early or give them an impression that we're skipping ads (we're not)
			) {
				youtubeVideoPlayer.pause();
			}
		}, 500);

		//
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
