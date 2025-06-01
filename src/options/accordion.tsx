import type { ReactNode } from "preact/compat";
import { useState } from "preact/hooks";

type AccordionProps = {
  defaultOpen?: boolean;
  title: string;
  content: ReactNode;
};
export default function Accordion({
  title,
  content,
  defaultOpen = false,
}: AccordionProps) {
  const [isOpen, setIsOpen] = useState<boolean>(defaultOpen);

  return (
    <div className="rounded-xl shadow-md my-4">
      <div className="border rounded-lg">
        <button
          type="button"
          className="w-full text-left px-4 py-3 font-semibold flex justify-between items-center"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span>{title}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            className={`w-5 h-5 transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
          >
            <title>{isOpen ? "Collapse" : "Expand"}</title>
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
        {isOpen && <div className="px-4 pb-4">{content}</div>}
      </div>
    </div>
  );
}
