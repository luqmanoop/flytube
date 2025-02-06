import type { YtVideoPlayer } from "./YtVideoPlayer";
import { isVideoWatchPage, waitFor } from "./utils";

export class EmbeddedPlayer {
	private ytVideoPlayer: YtVideoPlayer;
	private iframe: HTMLIFrameElement;
	private videoId: string;
	private seekInterval: Timer | null = null;

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

	private fastForward() {
		if (!this.player) return;

		this.seekInterval = setInterval(() => {
			if (!this.player) return;

			this.player.playbackRate = 2;
		}, 100);
	}

	private stopFastForward() {
		if (this.seekInterval) {
			clearInterval(this.seekInterval);
		}

		if (!this.player) return;

		this.player.playbackRate = 1;
	}

	private pressHoldTo2xPlayback() {
		/**
		 * Wait for the player to be ready
		 * TODO: fix player paused when mouseup
		 * TODO: visual indicator of fast forward
		 */
		waitFor(2000).then(() => {
			if (!this.player) return;

			this.player.addEventListener("mousedown", () => {
				this.fastForward();
			});

			this.player.addEventListener("mouseup", () => {
				this.stopFastForward();
			});
		});
	}

	render() {
		this.prepare();
		this.ytVideoPlayer.mount(this.iframe);

		this.pressHoldTo2xPlayback();
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
