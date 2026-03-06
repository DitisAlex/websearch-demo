export interface Usage {
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
}

export interface Stats {
  timeToFirstToken: number | null;
  totalTime: number | null;
  tokensPerSecond: number | null;
  usage: Usage | null;
}

export interface StreamState {
  thinkingText: string;
  outputText: string;
  searchStatus: "idle" | "searching" | "completed";
  isLoading: boolean;
  error: string | null;
  stats: Stats;
}
