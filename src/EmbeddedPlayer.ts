import type { YtVideoPlayer } from "./YtVideoPlayer";
import { isVideoWatchPage, waitFor } from "./utils";

export class EmbeddedPlayer {
	private ytVideoPlayer: YtVideoPlayer;
	private iframe: HTMLIFrameElement;
	private videoId: string;
	private seekInterval: Timer | null = null;
	private seekValue = 5; // 5 seconds https://support.google.com/youtube/answer/7631406?hl=en

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

	private holdTo2xPlayback() {
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

	get duration() {
		if (!this.player) return 0;

		return this.player.duration ?? 0;
	}

	togglePlayMode() {
		if (!this.player) return;

		if (this.player.paused) {
			this.player.play();
		} else {
			this.player.pause();
		}
	}

	seekForward() {
		if (!this.player || !this.duration) return;

		if (this.player.currentTime + this.seekValue > this.duration) {
			this.player.currentTime = this.duration;
		} else {
			this.player.currentTime += this.seekValue;
		}
	}

	seekBackward() {
		if (!this.player || !this.duration) return;

		if (this.player.currentTime - this.seekValue < 0) {
			this.player.currentTime = 0;
		} else {
			this.player.currentTime -= this.seekValue;
		}
	}

	focusPlayer(e?: MouseEvent | KeyboardEvent) {
		if (!this.player) return;

		const element = e?.target as HTMLElement | null;

		if (element?.contentEditable === "true") {
			return;
		}

		const isReadyToReceiveFocus = this.player.getAttribute("tabindex") === "0";

		if (isReadyToReceiveFocus) {
			this.player.focus();
		} else {
			this.player.setAttribute("tabindex", "0");
			this.player.focus();
		}
	}

	toggleMute() {
		if (!this.player) return;

		this.player.muted = !this.player.muted;
	}

	render() {
		this.prepare();
		this.ytVideoPlayer.mount(this.iframe);

		this.holdTo2xPlayback();

		waitFor(2000).then(() => {
			this.focusPlayer();

			document.addEventListener("keydown", () => this.focusPlayer());
		});
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
