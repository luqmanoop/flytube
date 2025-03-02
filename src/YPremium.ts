import { $, isVideoWatchPage, waitFor } from "./utils";

export class YPremium {
	private currentUrl: URL;
	private playerContainer: HTMLElement;
	private player: HTMLVideoElement;
	private adTrackerInterval: Timer | undefined;

	constructor(playerContainer: HTMLElement) {
		console.info("YPremium constructor");
		this.playerContainer = playerContainer;
		this.player = this.playerContainer.querySelector(
			"video",
		) as HTMLVideoElement;
		this.currentUrl = new URL(location.href);

		if (!this.player) {
			throw new Error("Player not found");
		}

		const style = document.createElement("style");
		style.textContent = `
  ytd-ad-slot-renderer, .ytd-player-legacy-desktop-watch-ads-renderer, ytd-companion-slot-renderer, [target-id="engagement-panel-ads"] {
    display: none !important;
  }
`;
		document.head.appendChild(style);

		window.navigation.addEventListener(
			"navigate",
			({ destination: { url } }) => {
				if (url !== this.currentUrl.href) {
					this.currentUrl = new URL(url);

					return !this.isWatchUrl
						? clearInterval(this.adTrackerInterval)
						: this.init();
				}
			},
		);
	}

	get isWatchUrl() {
		return isVideoWatchPage(this.currentUrl);
	}

	get currentTime() {
		return this.player.currentTime || 0;
	}

	set currentTime(value: number) {
		this.player.currentTime = value;
	}

	get duration() {
		return this.player.duration || 0;
	}

	get isAdsVideo() {
		return (
			this.playerContainer.classList.contains("ad-showing") && this.duration > 0
		);
	}

	get isSurvey() {
		return document.querySelector(".ytp-ad-survey") !== null;
	}

	private clickSkipAdsButton() {
		const skipAdButtons = [
			$("button.ytp-skip-ad-button"),
			$(".ytp-ad-skip-button-modern"),
			$(
				".ytp-ad-action-interstitial .ytp-ad-skip-button-slot .ytp-ad-skip-button-container",
			),
		].filter(Boolean) as HTMLElement[];

		console.log("skipAdButtons", skipAdButtons);
		if (skipAdButtons.length > 0) {
			console.log("skipAdButton", skipAdButtons[0]);
			skipAdButtons[0].click();
		}
	}

	private dismissPopup() {
		const dismissButton = $("#dismiss-button") as HTMLElement | null;

		if (dismissButton) {
			dismissButton.click();

			// return this.player.paused ? this.player.play() : null;
		}
	}

	init() {
		if (!this.isWatchUrl) return;

		console.info("::init::");

		this.dismissPopup();

		this.adTrackerInterval = setInterval(async () => {
			this.dismissPopup();
			// sometimes banner ads/survey ads are shown with skip button. Try to skip them
			this.clickSkipAdsButton();

			// if it's an ads video, go to end of ads
			if (this.isAdsVideo) {
				this.player.currentTime = this.duration;
				// 	if (this.player.playbackRate !== 4) {
				// 		this.player.playbackRate = 4;
				// 	}

				// 	this.clickSkipAdsButton();
				// } else {
				// 	if (this.player.playbackRate !== 1) {
				// 		this.player.playbackRate = 1;
				// 	}
			}

			console.log(this.duration, this.currentTime);
		}, 500);
	}
}
