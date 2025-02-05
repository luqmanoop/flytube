import { EmbeddedPlayer } from "./EmbeddedPlayer";
import { YtVideoPlayer } from "./YtVideoPlayer";
import { getVideoPlayer, isVideoWatchPage } from "./utils";

export class YPremium {
	private currentUrl: URL;
	private ytVideoPlayer: YtVideoPlayer | null = null;
	private embeddedPlayer: EmbeddedPlayer | null = null;

	constructor() {
		this.currentUrl = new URL(location.href);

		const style = document.createElement("style");
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
		if (!this.isWatchUrl) {
			this.embeddedPlayer?.destroy();
			return;
		}

		const videoPlayer = await getVideoPlayer();

		if (!videoPlayer || !this.videoId) {
			return;
		}

		this.embeddedPlayer?.destroy();

		this.ytVideoPlayer = new YtVideoPlayer(videoPlayer);
		await this.ytVideoPlayer.registerEvents();
		this.embeddedPlayer = new EmbeddedPlayer(this.ytVideoPlayer, this.videoId);
		this.embeddedPlayer.render();
	}
}
