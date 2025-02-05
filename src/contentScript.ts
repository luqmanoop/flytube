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

const embedPlayer = document.createElement("iframe");

const getPageUrl = (url: string) => new URL(url);

const isVideoWatchPage = (url: URL) =>
	/\/watch/.test(url.pathname) && Boolean(url.searchParams.get("v"));

const getVideoPlayer = async () =>
	waitForElement("#movie_player.html5-video-player");

const pauseCurrentVideo = async () => {
	const videoPlayer = await getVideoPlayer();

	if (!videoPlayer) return;

	await waitForElement("#player-container");

	const isVideoOrAdsPlaying = videoPlayer.classList.contains("playing-mode");

	if (isVideoOrAdsPlaying) {
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

	embedPlayer.style.cssText = `
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      z-index: 9999;
      border-radius: 12px;
  `;
	embedPlayer.setAttribute(
		"src",
		`https://www.youtube.com/embed/${videoId}?loop=1&autoplay=1`,
	);
	embedPlayer.setAttribute("id", videoId);

	await waitFor(500);

	videoPlayer.appendChild(embedPlayer);
};

const init = async (newUrl = location.href) => {
	const url = getPageUrl(newUrl);

	const videoId = url.searchParams.get("v");
	const playlistId = url.searchParams.get("list");

	await waitFor(500);

	if (!isVideoWatchPage(url)) {
		embedPlayer.remove();
		return;
	}

	// Remove iframe if active video changes to avoid previous iframe video playing in background
	if (embedPlayer?.src && embedPlayer?.id !== videoId) {
		embedPlayer.remove();
	}

	await waitFor(500);

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
				init(url);
			},
		);
	} catch (error) {
		console.error(error);
	}
})();
