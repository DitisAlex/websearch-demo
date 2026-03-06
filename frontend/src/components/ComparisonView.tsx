import type { StreamState } from "../types";
import { ResultPanel } from "./ResultPanel";

interface Props {
  gpt41Model: string;
  gpt52Model: string;
  gpt41State: StreamState;
  gpt52State: StreamState;
}

export function ComparisonView({ gpt41Model, gpt52Model, gpt41State, gpt52State }: Props) {
  return (
    <div className="flex flex-1 gap-4 min-h-0">
      <ResultPanel
        title="GPT-4.1"
        subtitle="Non-thinking"
        model={gpt41Model}
        state={gpt41State}
      />
      <ResultPanel
        title="GPT-5.2"
        subtitle="Thinking"
        model={gpt52Model}
        state={gpt52State}
      />
    </div>
  );
}
