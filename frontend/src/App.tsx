import { useStreamingResponse } from "./hooks/useStreamingResponse";
import { SearchForm } from "./components/SearchForm";
import { ComparisonView } from "./components/ComparisonView";

const GPT41_MODEL = "gpt-4.1-2025-04-14";
const GPT52_MODEL = "gpt-5.2-2025-12-11";

function App() {
  const gpt41 = useStreamingResponse();
  const gpt52 = useStreamingResponse();

  const handleSubmit = (systemPrompt: string, userMessage: string) => {
    gpt41.startStream(GPT41_MODEL, systemPrompt, userMessage, false);
    gpt52.startStream(GPT52_MODEL, systemPrompt, userMessage, true);
  };

  const isLoading = gpt41.isLoading || gpt52.isLoading;

  return (
    <div className="flex min-h-screen flex-col bg-gray-100 p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 mb-4">
          Web Search Demo — GPT-4.1 vs GPT-5.2
        </h1>
        <SearchForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
      <ComparisonView gpt41Model={GPT41_MODEL} gpt52Model={GPT52_MODEL} gpt41State={gpt41} gpt52State={gpt52} />
    </div>
  );
}

export default App;
