import Markdown from "react-markdown";
import type { Stats, StreamState } from "../types";
import { ThinkingBlock } from "./ThinkingBlock";

interface Props {
  title: string;
  subtitle: string;
  model: string;
  state: StreamState;
}

// EUR/1M tokens — approximate OpenAI pricing converted to EUR (~0.92 USD/EUR)
const USD_TO_EUR = 0.92;
const PRICING: Record<string, { input: number; output: number }> = {
  "gpt-4.1-2025-04-14": { input: 2.0 * USD_TO_EUR, output: 8.0 * USD_TO_EUR },
  "gpt-5.2-2025-12-11": { input: 2.0 * USD_TO_EUR, output: 8.0 * USD_TO_EUR },
};

function estimateCost(model: string, inputTokens: number, outputTokens: number): string {
  const price = PRICING[model];
  if (!price) return "N/A";
  const cost = (inputTokens * price.input + outputTokens * price.output) / 1_000_000;
  return `\u20AC${cost.toFixed(4)}`;
}

function StatsBar({ stats, isLoading, model }: { stats: Stats; isLoading: boolean; model: string }) {
  const { timeToFirstToken, totalTime, tokensPerSecond, usage } = stats;
  const hasStats = timeToFirstToken !== null || totalTime !== null || usage !== null;

  if (!hasStats && !isLoading) return null;

  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-gray-200 bg-gray-50 px-4 py-2 text-[11px] text-gray-500">
      {timeToFirstToken !== null && (
        <span>TTFT: <span className="font-medium text-gray-700">{timeToFirstToken.toFixed(2)}s</span></span>
      )}
      {totalTime !== null && (
        <span>Total: <span className="font-medium text-gray-700">{totalTime.toFixed(2)}s</span></span>
      )}
      {tokensPerSecond !== null && (
        <span>Speed: <span className="font-medium text-gray-700">{tokensPerSecond} tok/s</span></span>
      )}
      {usage && (
        <>
          <span>In: <span className="font-medium text-gray-700">{usage.input_tokens.toLocaleString()}</span></span>
          <span>Out: <span className="font-medium text-gray-700">{usage.output_tokens.toLocaleString()}</span></span>
          <span>Tokens: <span className="font-medium text-gray-700">{usage.total_tokens.toLocaleString()}</span></span>
          <span>Cost: <span className="font-medium text-green-700">{estimateCost(model, usage.input_tokens, usage.output_tokens)}</span></span>
        </>
      )}
      {isLoading && timeToFirstToken === null && (
        <span className="italic">Waiting for response...</span>
      )}
    </div>
  );
}

export function ResultPanel({ title, subtitle, model, state }: Props) {
  return (
    <div className="flex flex-1 flex-col rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
        <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 text-sm text-gray-800">
        {state.searchStatus === "searching" && !state.outputText && (
          <div className="mb-3 flex items-center gap-2 text-blue-600 text-xs">
            <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            Searching the web...
          </div>
        )}

        {state.searchStatus === "completed" && !state.outputText && state.isLoading && (
          <div className="mb-3 text-xs text-green-600">
            Web search complete. Generating response...
          </div>
        )}

        <ThinkingBlock
          text={state.thinkingText}
          isStreaming={state.isLoading && !!state.thinkingText}
        />

        {state.outputText && (
          <div className="prose prose-sm max-w-none">
            <Markdown
              components={{
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    {children}
                  </a>
                ),
              }}
            >
              {state.outputText}
            </Markdown>
          </div>
        )}

        {state.error && (
          <div className="rounded-lg bg-red-50 p-3 text-red-700 text-xs">
            {state.error}
          </div>
        )}

        {!state.isLoading && !state.outputText && !state.error && (
          <div className="text-gray-400 text-xs italic">
            Results will appear here...
          </div>
        )}
      </div>

      <StatsBar stats={state.stats} isLoading={state.isLoading} model={model} />
    </div>
  );
}
