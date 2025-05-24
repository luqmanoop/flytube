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

	mute() {
		this.player.muted = true;
	}

	unmute() {
		this.player.muted = false;
	}

	mount(node: HTMLElement) {
		this.playerContainer.appendChild(node);
	}
}
