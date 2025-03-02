import { YPremium } from "./YPremium";
import { getVideoPlayerContainer, waitFor } from "./utils";

(async () => {
	try {
		await waitFor(1000);
		const videoPlayerContainer = await getVideoPlayerContainer();

		if (!videoPlayerContainer) {
			throw new Error("Video player container not found");
		}

		const yPremium = new YPremium(videoPlayerContainer);
		yPremium.init();
	} catch (error) {
		console.error(error);
	}
})();
