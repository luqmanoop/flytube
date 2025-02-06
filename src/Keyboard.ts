export const Keyboard = {
	onSpacePressed: (cb: () => void) => {
		document.addEventListener("keydown", (e) => {
			if (e.key === " ") {
				cb();
			}
		});
	},

	onRightArrowPressed: (cb: () => void) => {
		document.addEventListener("keydown", (e) => {
			if (e.key === "ArrowRight") {
				cb();
			}
		});
	},

	onLeftArrowPressed: (cb: () => void) => {
		document.addEventListener("keydown", (e) => {
			if (e.key === "ArrowLeft") {
				cb();
			}
		});
	},
};
