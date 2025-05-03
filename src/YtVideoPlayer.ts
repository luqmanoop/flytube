/**
 * @description Manages the main YouTube video player.
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

	get allowedToPlay() {
		return this.isAllowedToPlay;
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

	mount(node: HTMLElement) {
		this.playerContainer.appendChild(node);
	}
}
