const css = document.createElement("style");
css.innerHTML = `
#flytube-toast-container {
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 99999999;
  }
  .flytube-toast {
    background-color: #333;
    border: 1px solid #ff213f;
    color: #fff;
    margin-bottom: 10px;
    padding: 8px;
    display: flex;
    gap: 4px;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    opacity: 0;
    transform: translateX(100%);
    transition: opacity 0.3s ease, transform 0.3s ease;
    width: 300px;
  }
  .flytube-toast-title {
    font-weight: bold;
    font-size: 1.45rem;
  }

  .flytube-toast-message {
    font-size: 1.3rem;
  }

  .flytube-toast.show {
    opacity: 1;
    transform: translateX(0);
  }

  .flytube-toast.hide {
    opacity: 0;
    transform: translateX(100%);
  }
`;

document.head.appendChild(css);

export const Toast = {
	id: "flytube-toast-container",
	duration: 4000,
	async show(container: HTMLElement, title: string, message: string) {
		this.cleanup();

		return new Promise((resolve) => {
			const toastContainer = document.createElement("div");
			toastContainer.id = this.id;
			container.appendChild(toastContainer);

			const toast = document.createElement("div");
			toast.className = "flytube-toast";

			const imgSrc = chrome.runtime.getURL("icons/48.png");

			toast.innerHTML = `
        <img src="${imgSrc}" alt="FlyTube" width="32" height="32" />
        <div style="display: flex; flex-direction: column; gap: 2px;">
          <div class="flytube-toast-title">${title}</div>
          <div class="flytube-toast-message">${message}</div>
        </div>
			`;

			const toastTitle = document.createElement("div");
			toastTitle.className = "toast-title";

			document.getElementById(this.id)?.appendChild(toast);

			requestAnimationFrame(() => {
				toast.classList.add("show");
			});

			setTimeout(() => {
				toast.classList.remove("show");
				toast.classList.add("hide");
			}, this.duration);

			toast.addEventListener("transitionend", () => {
				if (toast.classList.contains("hide")) {
					toast.remove();
					resolve(true);
				}
			});
		});
	},
	cleanup() {
		document.getElementById(this.id)?.remove();
	},
};
