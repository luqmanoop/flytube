import { Settings } from "src/settings";
import { Popup } from "src/popup/popup";

import Accordion from "./accordion";

const Options = () => {
  return (
    <div className="max-w-2xl mx-auto py-12">
      <Popup
        className="w-full"
        renderSettingsPreview={(settingId: string) => {
          if (settingId === Settings.allowBackgroundAds) {
            return (
              <Accordion
                title="Preview"
                content={
                  <div>
                    <video controls autoplay loop className="w-full">
                      <source
                        src="https://assets.luqmanoop.com/background-ads.mp4"
                        type="video/mp4"
                      />
                      <track kind="captions" />
                    </video>
                  </div>
                }
              />
            );
          }

          if (settingId === Settings.removeAdSlots) {
            return (
              <Accordion
                title="Preview"
                content={
                  <div>
                    <video controls autoplay loop className="w-full">
                      <source
                        src="https://assets.luqmanoop.com/remove-ad-slots.mp4"
                        type="video/mp4"
                      />
                      <track kind="captions" />
                    </video>
                  </div>
                }
              />
            );
          }

          if (settingId === Settings.showComparisonSlider) {
            return (
              <Accordion
                title="Preview"
                content={
                  <div>
                    <video controls autoplay loop className="w-full">
                      <source
                        src="https://assets.luqmanoop.com/compare.mp4"
                        type="video/mp4"
                      />
                      <track kind="captions" />
                    </video>
                  </div>
                }
              />
            );
          }

          return null;
        }}
      />
    </div>
  );
};

export default Options;
