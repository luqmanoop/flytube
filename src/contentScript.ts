import { waitFor, waitForElement } from "./utils";
const style = document.createElement("style");

style.textContent = `
  ytd-ad-slot-renderer, .ytd-player-legacy-desktop-watch-ads-renderer, ytd-companion-slot-renderer, [target-id="engagement-panel-ads"] {
    display: none !important;
  }
`;

document.head.appendChild(style);

const iframe = document.createElement("iframe");

const getVideoId = (url: string) => url.split("/watch?v=")[1];

const getActiveVideo = async () =>
	waitForElement("#player #container.ytd-player");

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

	iframe.setAttribute(
		"src",
		`https://www.youtube.com/embed/${videoId}?loop=1&autoplay=1`,
	);
	iframe.setAttribute("id", videoId);

	await waitForElement("#player-container");

	const moviePlayer = activeVideo.querySelector("#movie_player");

	if (!moviePlayer) return;

	const isVideoOrAdsPlaying = moviePlayer.classList.contains("playing-mode");

	await waitFor(500);

	if (isVideoOrAdsPlaying) {
		// pause current video
		(moviePlayer as HTMLElement).click();
	}

	await waitFor(500);

	activeVideo.appendChild(iframe);
};

(async () => {
	setTimeout(async () => {
		const activeVideo = await getActiveVideo();
		if (!activeVideo) return;
		await renderIframeOnVideo(activeVideo);
	}, 1000);
})();
