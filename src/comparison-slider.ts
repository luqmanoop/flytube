const css = document.createElement("style");
css.innerHTML = `
.slider {
  position: absolute;
  z-index: 999999 !important;
  inset: 0;
  cursor: pointer;
  opacity: 0;
  width: 100%;
  height: 100%;
}

.slider-divider {
  position: absolute;
  inset: 0;
  z-index: 999999 !important;
  width: .2rem;
  height: 100%;
  background-color: #fff;
  left: var(--position);
  transform: translateX(-50%);
  pointer-events: none;
}

.slider-handle {
  z-index: 999999 !important;
  box-shadow: transparent 0px 0px 6px;
  color: rgb(0, 0, 0);
  border: 1px solid rgba(0, 0, 0, 0.1);
  height: 48px;
  left: var(--position);
  pointer-events: none;
  position: absolute;
  cursor: ew-resize;
  top: 50%;
  transform: translate3d(-50%, -50%, 0px);
  width: 48px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  transition: background 0.3s, box-shadow 0.3s, opacity 0.5s 0.25s;
}


.slider-handle::before,
.slider-handle::after {
  content: "";
  height: 10px;
  position: absolute;
  z-index: 999999 !important;
  top: 50%;
  transform-origin: 0px 0px;
  width: 10px;
  border-left: 2px solid;
  border-top: 2px solid;
}

.slider-handle::before {
  left: 10px;
  transform: rotate(-45deg);
}

.slider-handle::after {
  right: 0px;
  transform: rotate(135deg);
}
`;

document.head.appendChild(css);

export const ComparisonSlider = {
	slider: null as HTMLDivElement | null,
	init(container: HTMLElement) {
		if (this.slider) {
			return;
		}

		const htmlTemplate = `<input
          type="range"
          min="0"
          max="100"
          value="0"
          aria-label="Before/after video percentage"
          class="slider"
        />
        <div class="slider-divider" aria-hidden="true"></div>
        <div class="slider-handle" aria-hidden="true"></div>
      </div>`;
		this.slider = document.createElement("div");
		this.slider.classList.add("bt-comparison-slider");
		this.slider.innerHTML = htmlTemplate;
		container.appendChild(this.slider);

		container.style.setProperty("--position", "0%");

		this.slider
			?.querySelector(".slider")
			?.addEventListener("input", (e: Event) => {
				const target = e.target as HTMLInputElement;
				container.style.setProperty("--position", `${target.value}%`);
			});
	},
	destroy() {
		if (this.slider) {
			this.slider.remove();
			this.slider = null;
		}
	},
};
