import featureFlags from "./featureFlags";
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

	get isMuted() {
		return this.player.muted;
	}

	mute() {
		console.log("mute", this.isMuted);
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

	get currentTime() {
		return this.player.currentTime;
	}

	set currentTime(value: number) {
		this.player.currentTime = value;
	}

	get duration() {
		return this.player.duration || 0;
	}

	private pauseOrMute() {
		if (featureFlags.keepWatchHistorySynced) {
			this.mute();
		} else {
			this.pause();
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

	async registerEvents() {
		await waitFor(2000);

		setInterval(() => {
			if (this.isAdsVideo) {
				console.log("skipping ads with duration", this.duration);
				this.currentTime = this.duration;
			} else if (this.isSurvey) {
				console.log("skipping survey");
				// this.currentTime = this.duration;
			}

			console.log(this.duration, this.currentTime);
		}, 500);

		// this.pauseOrMute();

		// pause background video/ads when it starts playing
		this.player.addEventListener("playing", () => {
			// this.pauseOrMute();
		});
	}

	mount(node: HTMLElement) {
		this.playerContainer.appendChild(node);
	}
}
