import { waitFor, waitForElement } from "./utils";

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

	async registerEvents() {
		await waitFor(500);

		this.pause();

		// pause background video/ads when it starts playing
		this.player.addEventListener("playing", () => {
			this.pause();
		});
	}

	mount(node: HTMLElement) {
		this.playerContainer.appendChild(node);
	}
}
