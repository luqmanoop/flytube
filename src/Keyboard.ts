const isNotContentEditable = (target: EventTarget | null) => {
	return (target as HTMLElement)?.contentEditable !== "true";
};

export const Keyboard = {
	onSpacePressed: (cb: () => void) => {
		document.addEventListener("keydown", (e) => {
			if (e.key === " " && isNotContentEditable(e.target)) {
				cb();
			}
		});
	},

	onRightArrowPressed: (cb: () => void) => {
		document.addEventListener("keydown", (e) => {
			if (e.key === "ArrowRight" && isNotContentEditable(e.target)) {
				cb();
			}
		});
	},

	onLeftArrowPressed: (cb: () => void) => {
		document.addEventListener("keydown", (e) => {
			if (e.key === "ArrowLeft" && isNotContentEditable(e.target)) {
				cb();
			}
		});
	},

	onMKeyPressed: (cb: () => void) => {
		document.addEventListener("keydown", (e) => {
			if (e.key === "m" && isNotContentEditable(e.target)) {
				cb();
			}
		});
	},
};
