export function App() {
  return (
    <div className="antialiased text-gray-900 dark:text-slate-300 tracking-tight bg-light dark:bg-slate-950 w-96 px-4 pt-2 pb-4">
      <div className="flex flex-col gap-2">
        <div className="flex flex-col items-center gap-1 text-center">
          <img
            src={chrome.runtime.getURL("icons/128.png")}
            alt="Y Premium (why premium?)"
            className="w-[90px] mb-0"
          />
          <h1 className="text-3xl font-bold mt-0 tracking-tighter">
            Y Premium
          </h1>
          <span className="text-xs text-gray-500 dark:text-slate-400">
            (why premium?)
          </span>
          <p className="text-base tracking-tight">
            Watch YouTube... Ad-free, no subscription.
          </p>
        </div>
        <div className="border-t border-gray-200 dark:border-slate-700 mt-2 py-4">
          <h3 className="text-lg font-bold mb-4">⚙️ Settings</h3>
          <div className="flex items-start gap-2 select-none">
            <input type="checkbox" id="background-ads" className="" />
            <div className="flex flex-col gap-1 relative -top-[5px]">
              <label htmlFor="background-ads" className="text-base">
                Play Ads in the background
              </label>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Support creators by allowing ads to play in the background. This
                doesn't affect your watch experience.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
