/**
 * @description Manages the main YouTube video player.
 */
export class YoutubePlayer {
	private playerContainer: HTMLElement;

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

	private getMuteButton() {
		return this.playerContainer.querySelector("button.ytp-mute-button") as
			| HTMLButtonElement
			| undefined;
	}

	private isMutedFromUI() {
		const muteButton = this.getMuteButton();

		// If the mute button has the speaker icon, it's unmuted.
		return !muteButton?.querySelector(".ytp-svg-volume-animation-speaker");
	}

	mute() {
		this.player.muted = true;

		const muteButton = this.getMuteButton();

		if (muteButton && !this.isMutedFromUI()) {
			muteButton.click(); // Click the mute button to mute.
		}
	}

	unmute() {
		this.player.muted = false;

		const muteButton = this.getMuteButton();

		if (muteButton && this.isMutedFromUI()) {
			muteButton.click(); // Click the mute button to unmute.
		}
	}

	mount(node: HTMLElement) {
		this.playerContainer.appendChild(node);
	}
}
