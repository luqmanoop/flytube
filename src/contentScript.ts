import { waitFor, waitForElement } from "./utils";

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

const style = document.createElement("style");

style.textContent = `
  ytd-ad-slot-renderer, .ytd-player-legacy-desktop-watch-ads-renderer, ytd-companion-slot-renderer, [target-id="engagement-panel-ads"] {
    display: none !important;
  }
`;

document.head.appendChild(style);

const embeddedPlayer = document.createElement("iframe");

const getPageUrl = (url: string) => new URL(url);
const getCurrentVideoId = (url: string) =>
	getPageUrl(url).searchParams.get("v");

let ignoreVideoId = "";
let currentUrl = location.href;

const isVideoWatchPage = (url: URL) =>
	/\/watch/.test(url.pathname) && Boolean(url.searchParams.get("v"));

const getVideoPlayer = async () =>
	waitForElement("#movie_player.html5-video-player");

const pauseCurrentVideo = async () => {
	const videoPlayer = await getVideoPlayer();

	if (!videoPlayer) return;

	await waitForElement("#player-container");

	if (!isVideoWatchPage(getPageUrl(currentUrl)) && embeddedPlayer.src) {
		embeddedPlayer.remove();
		return;
	}

	const currentVideoId = getCurrentVideoId(currentUrl);

	const isVideoOrAdsPlaying = videoPlayer.classList.contains("playing-mode");

	if (isVideoOrAdsPlaying && currentVideoId !== ignoreVideoId) {
		// click to pause current video/Ad
		(videoPlayer as HTMLElement).click();
	}
};

// aggressively attempt to pause original video player to avoid playing in background (e.g. due to (Space) keyboard events).
setInterval(async () => {
	await pauseCurrentVideo();
}, 500);

const renderIframeOnVideo = async (
	videoPlayer: HTMLElement,
	videoId: string,
	playlistId?: string | null, // TODO: add playlist support
) => {
	videoPlayer.style.position = "relative";

	embeddedPlayer.style.cssText = `
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      z-index: 9999;
      border-radius: 12px;
  `;
	embeddedPlayer.setAttribute(
		"src",
		`https://www.youtube.com/embed/${videoId}?loop=1&autoplay=1`,
	);
	embeddedPlayer.setAttribute("id", videoId);

	videoPlayer.appendChild(embeddedPlayer);

	waitFor(4000).then(() => {
		const embedError =
			embeddedPlayer.contentWindow?.document.querySelector(
				".ytp-error-content",
			);

		/**
		 * add videoId to ignore list
		 * play video normally
		 */

		if (embedError) {
			ignoreVideoId = videoId;
			embeddedPlayer.remove();
			videoPlayer.click();
		}
	});
};

const init = async (newUrl = location.href) => {
	const url = getPageUrl(newUrl);

	const videoId = url.searchParams.get("v");
	const playlistId = url.searchParams.get("list");

	ignoreVideoId = "";

	if (!isVideoWatchPage(url)) {
		embeddedPlayer.remove();
		return;
	}

	// Remove iframe if active video changes to avoid previous iframe video playing in background
	if (embeddedPlayer?.src && embeddedPlayer?.id !== videoId) {
		embeddedPlayer.remove();
	}

	const activeVideo = await getVideoPlayer();

	if (activeVideo && videoId && !playlistId) {
		renderIframeOnVideo(activeVideo, videoId);
	}
};

(() => {
	try {
		// first init if current url is a video url due to page reload or coming from external website
		init();

		// reinitialize on page navigation
		window.navigation.addEventListener(
			"navigate",
			({ destination: { url } }) => {
				currentUrl = url;
				init(url);
			},
		);
	} catch (error) {
		console.error(error);
	}
})();
