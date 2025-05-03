import { EmbeddedPlayer } from "./EmbeddedPlayer";
import { YtVideoPlayer } from "./YtVideoPlayer";
import featureFlags from "./featureFlags";
import { getVideoPlayerContainer, isVideoWatchPage } from "./utils";

/**
 * @description handles when to show/destroy the embedded player.
 */
export class YPremium {
	private currentUrl: URL;
	private ytVideoPlayer: YtVideoPlayer | null = null;
	private embeddedPlayer: EmbeddedPlayer | null = null;

	constructor() {
		this.currentUrl = new URL(location.href);

		const style = document.createElement("style");
		// remove ads slots
		style.textContent = `
  ytd-ad-slot-renderer, .ytd-player-legacy-desktop-watch-ads-renderer, ytd-companion-slot-renderer, [target-id="engagement-panel-ads"] {
    display: none !important;
  }
`;
		document.head.appendChild(style);

		this.init();

		window.navigation.addEventListener(
			"navigate",
			({ destination: { url } }) => {
				if (url !== this.currentUrl.href) {
					this.currentUrl = new URL(url);
					this.init();
				}
			},
		);
	}

	get url() {
		return this.currentUrl;
	}

	get isWatchUrl() {
		return isVideoWatchPage(new URL(this.url));
	}

	get videoId() {
		return this.currentUrl.searchParams.get("v");
	}

	get playlistId() {
		return this.currentUrl.searchParams.get("list");
	}

	async init() {
		this.embeddedPlayer?.destroy();

		if (!this.isWatchUrl) return;

		const videoPlayerContainer = await getVideoPlayerContainer();

		if (!videoPlayerContainer || !this.videoId) return;

		this.ytVideoPlayer = new YtVideoPlayer(videoPlayerContainer);

		this.embeddedPlayer = new EmbeddedPlayer(this.ytVideoPlayer, this.videoId);
		this.embeddedPlayer.render();

		// aggressively mute YtPlayer once the embedded player is rendered without any errors
		const muteYtPlayerIntervalId = setInterval(() => {
			if (!this.ytVideoPlayer?.allowedToPlay && !this.ytVideoPlayer?.isMuted) {
				this.ytVideoPlayer?.mute();
			}
		}, 500);

		this.embeddedPlayer.onFailedToLoad((intervalId) => {
			clearInterval(intervalId);
			clearInterval(muteYtPlayerIntervalId);
			this.embeddedPlayer?.destroy();

			this.ytVideoPlayer?.setIsAllowedToPlay(true);
			this.ytVideoPlayer?.play();
			this.ytVideoPlayer?.unmute();
		});
	}
}
