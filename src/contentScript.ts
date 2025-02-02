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

const iframe = document.createElement("iframe");

const getVideoId = (url: string) => url.split("/watch?v=")[1];

const isVideoUrl = (url: string) => /youtube.com\/watch\?v=/.test(url);

const getActiveVideo = async () =>
	waitForElement("#player #container.ytd-player");

const pauseCurrentVideo = async () => {
	const activeVideo = await getActiveVideo();

	if (!activeVideo) return;

	await waitFor(1000);

	await waitForElement("#player-container");

	const moviePlayer = activeVideo.querySelector("#movie_player");

	if (!moviePlayer) return;

	const isVideoOrAdsPlaying = moviePlayer.classList.contains("playing-mode");

	if (isVideoOrAdsPlaying) {
		// pause current video
		(moviePlayer as HTMLElement).click();
	}
};

const renderIframeOnVideo = async (activeVideo: HTMLElement) => {
	iframe.id = "iframe";
	iframe.style.cssText = `
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      z-index: 10;
      border-radius: 12px;
  `;

	activeVideo.style.position = "relative";

	const videoId = getVideoId(location.href);

	await pauseCurrentVideo();

	iframe.setAttribute(
		"src",
		`https://www.youtube.com/embed/${videoId}?loop=1&autoplay=1`,
	);
	iframe.setAttribute("id", videoId);

	await waitFor(500);

	activeVideo.appendChild(iframe);
};

const init = async (url = location.href) => {
	const activeUrl = url;
	const videoId = getVideoId(activeUrl);

	await waitFor(500);

	// Remove iframe if active video changes to avoid previous iframe video playing in background
	if (iframe?.src && iframe?.id !== videoId) {
		iframe.remove();
	}

	if (!isVideoUrl(activeUrl)) return;

	await waitFor(500);

	const activeVideo = await getActiveVideo();

	if (activeVideo) {
		renderIframeOnVideo(activeVideo);
	}
};

(() => {
	try {
		// first init if current url is a video url due to page reload or coming from external website
		init();

		// reinitialize on page navigation while on YouTube
		window.navigation.addEventListener("navigate", ({ destination: { url } }) =>
			init(url),
		);
	} catch (error) {
		console.error(error);
	}
})();
