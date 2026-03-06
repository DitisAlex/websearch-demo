import { useState } from "react";

interface Props {
  text: string;
  isStreaming: boolean;
}

export function ThinkingBlock({ text, isStreaming }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  if (!text) return null;

  return (
    <div className="mb-4 rounded-lg border-l-4 border-amber-400 bg-amber-50">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm font-medium text-amber-800"
      >
        <span className={`transition-transform ${collapsed ? "" : "rotate-90"}`}>
          &#9654;
        </span>
        Thinking{isStreaming ? "..." : ""}
      </button>
      {!collapsed && (
        <div className="px-4 pb-3 text-sm text-amber-900 whitespace-pre-wrap">
          {text}
        </div>
      )}
    </div>
  );
}
