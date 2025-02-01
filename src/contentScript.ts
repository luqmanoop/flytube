import { waitForElement } from "./utils";
const style = document.createElement("style");

style.textContent = `
  ytd-ad-slot-renderer, .ytd-player-legacy-desktop-watch-ads-renderer, ytd-companion-slot-renderer, [target-id="engagement-panel-ads"] {
    display: none !important;
  }
`;

document.head.appendChild(style);

// const iframe = document.createElement("iframe");

const isVideoUrl = (url: string) => /youtube.com\/watch\?v=/.test(url);

const getVideoId = (url: string) => url.split("/watch?v=")[1];

const getActiveVideo = async () =>
	waitForElement("#player #container.ytd-player");

const renderOverlayOnVideo = (activeVideo: HTMLElement) => {
	const overlay = document.createElement("div");
	overlay.id = "overlay";
	overlay.style.cssText = `
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 10;
  `;
	overlay.style.pointerEvents = "none";

	activeVideo.style.position = "relative";
	activeVideo.appendChild(overlay);

	return overlay;
};

(async () => {
	setTimeout(async () => {
		const activeVideo = await getActiveVideo();
		if (!activeVideo) return;
		renderOverlayOnVideo(activeVideo);
	}, 4000);
})();
