import throttle from "lodash.throttle";
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
  .flytube-hide {
    display: none !important;
  }
`;

document.head.appendChild(style);

// spinner credit: https://github.com/n3r4zzurr0/svg-spinners
const spinner = `<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><style>.spinner_jCIR{animation:spinner_B8Vq .9s linear infinite;animation-delay:-.9s}.spinner_upm8{animation-delay:-.8s}.spinner_2eL5{animation-delay:-.7s}.spinner_Rp9l{animation-delay:-.6s}.spinner_dy3W{animation-delay:-.5s}@keyframes spinner_B8Vq{0%,66.66%{animation-timing-function:cubic-bezier(0.36,.61,.3,.98);y:6px;height:12px}33.33%{animation-timing-function:cubic-bezier(0.36,.61,.3,.98);y:1px;height:22px}}</style><rect class="spinner_jCIR" x="1" y="6" width="2.8" height="12"/><rect class="spinner_jCIR spinner_upm8" x="5.8" y="6" width="2.8" height="12"/><rect class="spinner_jCIR spinner_2eL5" x="10.6" y="6" width="2.8" height="12"/><rect class="spinner_jCIR spinner_Rp9l" x="15.4" y="6" width="2.8" height="12"/><rect class="spinner_jCIR spinner_dy3W" x="20.2" y="6" width="2.8" height="12"/></svg>`;

const loaderContainer = document.createElement("div");
loaderContainer.id = "flytube-loader-container";

loaderContainer.style.cssText = `
	  width: 100%;
	  height: 100%;
	  position: absolute;
		top: 0;
		left: 0;
		bottom: 0;
		right: 0;
		z-index: 1150 !important;
	  border-radius: 12px;
    background: #090b16;
    display: flex;
    justify-content: center;
    align-items: center;
    fill: #fff;
	`;

loaderContainer.innerHTML = spinner;

const adSlotsStyle = document.createElement("style");
adSlotsStyle.innerHTML = `
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
		document.head.appendChild(adSlotsStyle);
	} else {
		adSlotsStyle.remove();
	}
};

const showLoader = () => {
	loaderContainer.classList.remove("flytube-hide");
};

const hideLoader = () => {
	loaderContainer.classList.add("flytube-hide");
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

	showLoader();

	videoPlayerContainer.appendChild(loaderContainer);

	const ytPlayer = new YoutubePlayer(videoPlayerContainer);
	const embedPlayer = new EmbeddedPlayer(videoId);

	ytPlayer.mute();

	if (settings[Settings.allowBackgroundAds]) {
		ytPlayer.play();
	} else {
		ytPlayer.pause();
	}

	if (settings[Settings.showComparisonSlider]) {
		ComparisonSlider.init(videoPlayerContainer);
	}

	emitter.on(Settings.allowBackgroundAds, (isEnabled) => {
		if (isEmbedError) return;

		return isEnabled ? ytPlayer.play() : ytPlayer.pause();
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
			ytPlayer.play();
		} else {
			ytPlayer.pause();
		}
	};

	embedPlayer.onPlayStateChange(handlePlayStateChange);

	emitter.on("hide-loader", hideLoader);

	const checkEmbedErrorId = setInterval(() => {
		if (embedPlayer.iframeDocument && embedPlayer.errorContent) {
			isEmbedError = true;
			videoPlayerContainer.classList.add("flytube-error"); // trigger mutation observer
			clearInterval(checkEmbedErrorId);
		} else if (embedPlayer.iframeDocument && embedPlayer.player?.currentTime) {
			emitter.emit("hide-loader");
			videoPlayerContainer.classList.toggle("flytube"); // trigger mutation observer
		}
	}, 500);

	const disconnectObserver = onClassChange(
		videoPlayerContainer,
		throttle(async () => {
			const isIframeInDom = embedPlayer.iframeDocument;
			const isIframeError = embedPlayer.errorContent;

			const flyTubeError =
				videoPlayerContainer.classList.contains("flytube-error");

			if (!isIframeInDom) return;

			if (!isIframeError || !flyTubeError) {
				// always mute underlying player when flytube is loaded. otherwise, if underlying player changes from ad to video or vice versa, mute state might not be updated correctly.
				ytPlayer.mute();
			} else if ((isIframeError || flyTubeError) && !isEmbedErrorHandled) {
				isEmbedError = true;

				videoPlayerContainer.classList.remove("flytube-error");

				ytPlayer.pause();

				await Toast.show(
					videoPlayerContainer,
					"Failed to load",
					"The native YouTube player will now be used & you may see ads.",
				);

				ytPlayer.unmute();
				ytPlayer.play();

				cleanup();

				isEmbedErrorHandled = true;

				disconnectObserver();

				emitter.emit("hide-loader");
			}
		}, 500),
	);

	ytPlayer.mount(embedPlayer.iframeElement);
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
