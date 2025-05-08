import { isVideoWatchPage, waitFor } from "./utils";

/**
 * @description Embedded YouTube video player overlayed on top of the main YouTube video player.
 */
export class EmbeddedPlayer {
	private iframe: HTMLIFrameElement;
	private videoId: string;
	private seekInterval: Timer | undefined;
	private seekValue = 5; // 5 seconds https://support.google.com/youtube/answer/7631406?hl=en

	constructor(videoId: string) {
		this.iframe = document.createElement("iframe");
		this.videoId = videoId;

		this.iframe.style.cssText = `
      width: 100%;
      height: 100%;
      position: absolute;
			top: 0;
			left: var(--position);
			bottom: 0;
			right: 0;
			z-index: 99999 !important;
      border-radius: 12px;
  `;
		this.iframe.setAttribute(
			"src",
			`https://www.youtube.com/embed/${this.videoId}?autoplay=1`,
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

	get iframeElement(): HTMLIFrameElement {
		return this.iframe;
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
		clearInterval(this.seekInterval);

		if (!this.player) return;

		this.player.playbackRate = 1;
	}

	get isFinishedPlaying() {
		if (!this.player) return false;

		return this.player.currentTime >= this.duration;
	}

	get isPaused() {
		if (!this.player) return false;

		return !!(this.player.duration && this.player.paused);
	}

	private holdTo2xPlayback() {
		/**
		 * Wait for the player to be ready
		 * TODO: fix player paused when mouseup
		 * TODO: visual indicator of fast forward
		 */
		waitFor(2000).then(() => {
			if (!this.player) return;

			this.player.addEventListener("mousedown", (e) => {
				// ignore if it's a right click
				if (e.button === 2) return;

				this.fastForward();
			});

			this.player.addEventListener("mouseup", () => {
				this.stopFastForward();
			});
		});
	}

	get currentTime() {
		if (!this.player) return 0;

		return this.player.currentTime;
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

	destroy() {
		this.iframe.remove();
	}

	onFailedToLoad(cb: () => void) {
		const errorCallback = () => this.errorContent && cb();

		const onIframeLoad = new Promise((resolve) => {
			this.iframe.addEventListener("load", () => resolve(true));
		});

		onIframeLoad.then(errorCallback).catch(errorCallback).catch(errorCallback);
	}
}
