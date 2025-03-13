import featureFlags from "./featureFlags";
import { waitFor } from "./utils";

/**
 * @description This class is used to control the main YouTube video player.
 */
export class YtVideoPlayer {
	private playerContainer: HTMLElement;
	private player: HTMLVideoElement;
	private isAllowedToPlay = false;

	constructor(playerContainer: HTMLElement) {
		this.playerContainer = playerContainer;

		this.playerContainer.style.position = "relative";

		this.player = this.playerContainer.querySelector(
			"video",
		) as HTMLVideoElement;

		if (!this.player) {
			throw new Error("Player not found");
		}
	}

	play() {
		this.player.play();
	}

	pause() {
		if (!this.isAllowedToPlay) {
			this.player.pause();
		}
	}

	setIsAllowedToPlay(value: boolean) {
		this.isAllowedToPlay = value;
	}

	isPlaying() {
		return !this.player.paused;
	}

	get isMuted() {
		return this.player.muted;
	}

	mute() {
		if (!this.isMuted) {
			this.player.muted = true;
		}
	}

	unmute() {
		console.log("unmute", this.isMuted);
		if (this.isMuted) {
			this.player.muted = false;
		}
	}

	get isAdsVideo() {
		return (
			this.playerContainer.classList.contains("ad-showing") && !this.isSurvey
		);
	}

	get isSurvey() {
		return document.querySelector(".ytp-ad-survey") !== null;
	}

	get currentTime() {
		return this.player.currentTime;
	}

	set currentTime(value: number) {
		this.player.currentTime = value;
	}

	get isAllowedToMovePlayhead() {
		return this.player && !this.isAdsVideo && !this.isSurvey;
	}

	private pauseOrMute() {
		if (featureFlags.keepWatchHistorySynced) {
			this.mute();
		} else {
			this.pause();
		}
	}

	async registerEvents() {
		await waitFor(2000);

		this.pauseOrMute();

		// pause/mute background video/ads when it starts playing
		this.player.addEventListener("playing", () => {
			this.pauseOrMute();
		});
	}

	mount(node: HTMLElement) {
		this.playerContainer.appendChild(node);
	}
}
