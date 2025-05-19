import type { JSXInternal } from "node_modules/preact/src/jsx";
import { useState, useEffect } from "preact/hooks";
import type { JSX } from "preact/jsx-runtime";

import { getSettings, SettingsConfig } from "src/settings";
import { storage } from "src/utils";

type Props = Pick<JSXInternal.HTMLAttributes, "className">;

export function Popup(props?: Props) {
  const [settings, setSettings] = useState<Partial<Record<string, boolean>>>(
    {}
  );

  useEffect(() => {
    const updateSettings = () => {
      if (!document.hidden) {
        getSettings().then((_settings) => {
          if (_settings) {
            setSettings(_settings);
          }
        });
      }
    };

    updateSettings();

    document.addEventListener("visibilitychange", updateSettings);

    return () => {
      document.removeEventListener("visibilitychange", updateSettings);
    };
  }, []);

  const handleSettingChange = (
    e: JSX.TargetedEvent<HTMLInputElement, Event>
  ) => {
    const target = e.target as HTMLInputElement;
    storage.set(target.name, target.checked);
    setSettings({
      ...settings,
      [target.name]: target.checked,
    });
  };

  return (
    <div className={`w-96 px-4 pt-4 pb-4 ${props?.className}`}>
      <div className="flex flex-col gap-2">
        <div className="flex flex-col items-center gap-1 text-center">
          <img
            src={chrome.runtime.getURL("icons/128.png")}
            alt="FlyTube"
            className="w-[90px] mb-0 rounded-xl"
          />
          <h1 className="text-3xl font-bold mt-0 tracking-tighter">FlyTube</h1>
          <p className="text-base tracking-tight">
            Ad-free YouTube, no subscription.
          </p>
        </div>
        <div className="border-t border-gray-200 dark:border-slate-700 mt-2 py-4 flex flex-col gap-2">
          <h3 className="text-lg font-bold mb-3">Settings</h3>
          {SettingsConfig.map((setting) => (
            <div
              key={setting.id}
              className="flex items-start gap-2 select-none"
            >
              <input
                type="checkbox"
                id={setting.id}
                name={setting.id}
                checked={settings[setting.id] ?? false}
                onChange={handleSettingChange}
                aria-describedby={`${setting.id}-description`}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
              />
              <div className="flex flex-col gap-1 relative -top-[5px]">
                <label htmlFor={setting.id} className="text-base">
                  {setting.title}
                </label>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  {setting.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
