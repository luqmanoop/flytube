/**
 * @description Manages the main YouTube video player.
 */
export class YoutubeVideoPlayer {
	private playerContainer: HTMLElement;
	private muted = false;

	constructor(playerContainer: HTMLElement) {
		this.playerContainer = playerContainer;

		this.playerContainer.style.position = "relative";

		if (!this.player) {
			throw new Error("Player not found");
		}
	}

	get player(): HTMLVideoElement {
		return this.playerContainer.querySelector("video") as HTMLVideoElement;
	}

	play() {
		this.player.play();
	}

	pause() {
		this.player.pause();
	}

	isPlaying() {
		return !this.player.paused;
	}

	get isMuted() {
		return this.muted;
	}

	mute() {
		this.player.muted = true;
		this.muted = true;
	}

	unmute() {
		this.player.muted = false;
		this.muted = false;
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

	mount(node: HTMLElement) {
		this.playerContainer.appendChild(node);
	}
}
