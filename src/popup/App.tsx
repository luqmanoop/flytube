import { useEffect, useState } from "react";

import { getSettings, SettingsConfig } from "src/settings";
import { storage } from "src/utils";

export function App() {
  const [settings, setSettings] = useState<Partial<Record<string, boolean>>>(
    {}
  );

  useEffect(() => {
    getSettings().then((_settings) => {
      if (_settings) {
        setSettings(_settings);
      }
    });
  }, []);

  const handleSettingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    storage.set(e.target.name, e.target.checked);
    setSettings({
      ...settings,
      [e.target.name]: e.target.checked,
    });
  };

  return (
    <div className="antialiased text-gray-900 dark:text-slate-300 tracking-tight bg-light dark:bg-slate-950 w-96 px-4 pt-4 pb-4">
      <div className="flex flex-col gap-2">
        <div className="flex flex-col items-center gap-1 text-center">
          <img
            src={chrome.runtime.getURL("icons/128.png")}
            alt="BrewTube"
            className="w-[90px] mb-0 rounded-xl"
          />
          <h1 className="text-3xl font-bold mt-0 tracking-tighter">BrewTube</h1>
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
