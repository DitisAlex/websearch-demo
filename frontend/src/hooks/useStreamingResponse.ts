import { useCallback, useRef, useState } from "react";
import type { Stats, StreamState } from "../types";

const INITIAL_STATS: Stats = {
  timeToFirstToken: null,
  totalTime: null,
  tokensPerSecond: null,
  usage: null,
};

const INITIAL_STATE: StreamState = {
  thinkingText: "",
  outputText: "",
  searchStatus: "idle",
  isLoading: false,
  error: null,
  stats: INITIAL_STATS,
};

export function useStreamingResponse() {
  const [state, setState] = useState<StreamState>(INITIAL_STATE);
  const abortRef = useRef<AbortController | null>(null);

  const startStream = useCallback(
    async (model: string, systemPrompt: string, userMessage: string, isThinking: boolean = false) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setState({ ...INITIAL_STATE, isLoading: true });

      const startTime = performance.now();
      let firstTokenTime: number | null = null;

      try {
        const resp = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model,
            system_prompt: systemPrompt,
            user_message: userMessage,
            is_thinking: isThinking,
          }),
          signal: controller.signal,
        });

        if (!resp.ok) {
          const text = await resp.text();
          setState((s) => ({ ...s, isLoading: false, error: text }));
          return;
        }

        const reader = resp.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n\n");
          buffer = parts.pop()!;

          for (const part of parts) {
            const lines = part.split("\n");
            let eventType = "";
            let data = "";

            for (const line of lines) {
              if (line.startsWith("event: ")) eventType = line.slice(7);
              else if (line.startsWith("data: ")) data = line.slice(6);
            }

            if (!eventType || !data) continue;

            try {
              const parsed = JSON.parse(data);

              switch (eventType) {
                case "thinking":
                  setState((s) => ({
                    ...s,
                    thinkingText: s.thinkingText + parsed.delta,
                  }));
                  break;
                case "text":
                  if (firstTokenTime === null) {
                    firstTokenTime = performance.now();
                    setState((s) => ({
                      ...s,
                      outputText: s.outputText + parsed.delta,
                      stats: { ...s.stats, timeToFirstToken: (firstTokenTime! - startTime) / 1000 },
                    }));
                  } else {
                    setState((s) => ({
                      ...s,
                      outputText: s.outputText + parsed.delta,
                    }));
                  }
                  break;
                case "web_search_status":
                  setState((s) => ({ ...s, searchStatus: parsed.status }));
                  break;
                case "usage":
                  setState((s) => ({
                    ...s,
                    stats: { ...s.stats, usage: parsed },
                  }));
                  break;
                case "done": {
                  const totalTime = (performance.now() - startTime) / 1000;
                  setState((s) => {
                    const outputTokens = s.stats.usage?.output_tokens ?? 0;
                    const tokensPerSecond = totalTime > 0 && outputTokens > 0
                      ? Math.round(outputTokens / totalTime)
                      : null;
                    return {
                      ...s,
                      isLoading: false,
                      searchStatus: s.searchStatus === "searching" ? "completed" : s.searchStatus,
                      stats: { ...s.stats, totalTime, tokensPerSecond },
                    };
                  });
                  break;
                }
                case "error":
                  setState((s) => ({
                    ...s,
                    isLoading: false,
                    error: parsed.message || JSON.stringify(parsed),
                  }));
                  break;
              }
            } catch {
              // skip unparseable data
            }
          }
        }

        // Stream ended without explicit done event
        setState((s) => {
          if (!s.isLoading) return s;
          const totalTime = (performance.now() - startTime) / 1000;
          const outputTokens = s.stats.usage?.output_tokens ?? 0;
          const tokensPerSecond = totalTime > 0 && outputTokens > 0
            ? Math.round(outputTokens / totalTime)
            : null;
          return {
            ...s,
            isLoading: false,
            stats: { ...s.stats, totalTime, tokensPerSecond },
          };
        });
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        setState((s) => ({
          ...s,
          isLoading: false,
          error: err instanceof Error ? err.message : "Unknown error",
        }));
      }
    },
    []
  );

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setState((s) => ({ ...s, isLoading: false }));
  }, []);

  return { ...state, startStream, cancel };
}
