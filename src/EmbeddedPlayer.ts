import { waitFor } from "./utils";

/**
 * @description Embedded YouTube video player overlayed on top of the main YouTube video player.
 */
export class EmbeddedPlayer {
	private iframe: HTMLIFrameElement;
	private videoId: string;

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
		this.iframe.setAttribute("id", "brewtube-player");

		this.onLoaded(() => {
			this.focusPlayer();
			this.normalize();
		});

		document.addEventListener("keydown", (e) => {
			this.focusPlayer(e);
		});
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

	normalize() {
		const css = document.createElement("style");
		css.innerHTML = `
		.ytp-pause-overlay,
		.ytp-show-cards-title {
			display: none;
		}
		`;

		this.iframe.contentWindow?.document.head.appendChild(css);

		this.onFinishedPlaying(() => {
			const endScreenContainer =
				this.iframe.contentWindow?.document.querySelector(
					".ytp-endscreen-content",
				) as HTMLElement;

			const endScreenVideos = Array.from(
				endScreenContainer?.querySelectorAll(
					'a[target="_blank"]',
				) as NodeListOf<HTMLElement>,
			);

			for (const endScreenVideo of endScreenVideos) {
				const videoUrl = endScreenVideo.getAttribute("href");

				const clonedEndScreenVideo = endScreenVideo.cloneNode(
					true,
				) as HTMLElement;
				clonedEndScreenVideo.removeAttribute("target");
				clonedEndScreenVideo.removeAttribute("href");

				clonedEndScreenVideo.addEventListener("click", () => {
					window.open(videoUrl ?? "", "_self");
				});

				// remove original embedded yt end screen video to remove the listeners that opens video in new tab
				endScreenVideo.remove();

				endScreenContainer.appendChild(clonedEndScreenVideo);
			}
		});
	}

	get isFinishedPlaying() {
		if (!this.player) return false;

		return this.player.currentTime >= this.duration;
	}

	get isPaused() {
		if (!this.player) return false;

		return !!(this.player.duration && this.player.paused);
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

	focusPlayer(e?: MouseEvent | KeyboardEvent) {
		if (!this.player) return;

		const element = e?.target as HTMLElement | null;

		if (element?.contentEditable === "true") {
			return;
		}

		const isReadyToReceiveFocus = this.player.getAttribute("tabindex") === "-1";

		if (isReadyToReceiveFocus) {
			this.player.focus({ preventScroll: true });
		} else {
			this.player.setAttribute("tabindex", "-1");
			this.player.focus({ preventScroll: true });
		}
	}

	destroy() {
		this.iframe.remove();
	}

	onPaused(cb: () => void) {
		if (!this.player) return;

		this.player.addEventListener("pause", cb);
	}

	onPlay(cb: () => void) {
		if (!this.player) return;

		this.player.addEventListener("play", cb);
	}

	onLoaded(cb: (player: HTMLVideoElement) => void) {
		this.iframe.addEventListener("load", async () => {
			await waitFor(2500);

			if (!this.player || this.errorContent) return;

			cb(this.player);
		});
	}

	onPlayStateChange(cb: (isPlaying: boolean) => void) {
		this.onLoaded((player) => {
			player.addEventListener("pause", () => cb(false));
			player.addEventListener("ended", () => cb(false));
			player.addEventListener("play", () => cb(true));
		});
	}

	onFinishedPlaying(cb: () => void) {
		if (!this.player) return;

		this.player.addEventListener("ended", cb);
	}
}
