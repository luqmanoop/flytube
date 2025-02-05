import type { YtVideoPlayer } from "./YtVideoPlayer";
import { isVideoWatchPage } from "./utils";

export class EmbeddedPlayer {
	private ytVideoPlayer: YtVideoPlayer;
	private iframe: HTMLIFrameElement;
	private videoId: string;

	constructor(ytVideoPlayer: YtVideoPlayer, videoId: string) {
		this.iframe = document.createElement("iframe");
		this.ytVideoPlayer = ytVideoPlayer;
		this.videoId = videoId;

		window.navigation.addEventListener(
			"navigate",
			({ destination: { url } }) => {
				if (!isVideoWatchPage(new URL(url))) {
					this.destroy();
				}
			},
		);
	}

	prepare() {
		this.iframe.style.cssText = `
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      z-index: 9999;
      border-radius: 12px;
  `;
		this.iframe.setAttribute(
			"src",
			`https://www.youtube.com/embed/${this.videoId}?loop=1&autoplay=1`,
		);
		this.iframe.setAttribute("id", this.videoId);
	}

	get currentVideoId() {
		return this.videoId;
	}

	get errorContent(): HTMLElement | null {
		return this.iframe.contentWindow?.document.querySelector(
			".ytp-error-content",
		) as HTMLElement | null;
	}

	get player(): HTMLVideoElement | null {
		return this.iframe.contentWindow?.document.querySelector(
			"video",
		) as HTMLVideoElement | null;
	}

	render() {
		this.prepare();
		this.ytVideoPlayer.mount(this.iframe);
	}

	destroy() {
		this.iframe.remove();
	}

	onFailedToLoad(cb: (intervalId: Timer) => void) {
		const interval = setInterval(() => {
			if (this.errorContent) {
				cb(interval);
			}
		}, 500);
	}
}
