// --- Helper Components for UI ---
const UploadIcon = () => (
  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
);
const SearchIcon = () => (
  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
);
const Spinner = () => (
  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);
const ResultCard = ({ text, index }) => (
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 shadow-md transition-transform hover:scale-105">
        <h3 className="text-lg font-semibold text-indigo-400 mb-2">Result {index + 1}</h3>
        <p className="text-gray-300">{text}</p>
    </div>
);

// --- Main App Component ---
function App() {
  const { useState, useCallback } = React;
  const [file, setFile] = useState(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [fileName, setFileName] = useState('');
  const [geminiSummary, setGeminiSummary] = useState('');
  const [geminiQuestions, setGeminiQuestions] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
        setFile(selectedFile);
        setFileName(selectedFile.name);
        setMessage(''); setError(''); setResults([]); setGeminiSummary(''); setGeminiQuestions([]);
    }
  };

  const handleUpload = useCallback(async () => {
    if (!file) { setError('Please select a file first.'); return; }
    setIsUploading(true); setError(''); setMessage(''); setResults([]); setGeminiSummary(''); setGeminiQuestions([]);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetch('/upload/', { method: 'POST', body: formData });
      if (!response.ok) { const errData = await response.json(); throw new Error(errData.detail || 'File upload failed'); }
      const data = await response.json();
      setMessage(`Successfully indexed ${data.indexed_chunks} chunks from ${data.filename}.`);
    } catch (err) { setError(err.message); } finally { setIsUploading(false); }
  }, [file]);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) { setError('Please enter a search query.'); return; }
    setIsSearching(true); setError(''); setResults([]); setMessage(''); setGeminiSummary(''); setGeminiQuestions([]);
    try {
      const response = await fetch(`/search/?q=${encodeURIComponent(query)}`);
      if (!response.ok) { const errData = await response.json(); throw new Error(errData.detail || 'Search failed'); }
      const data = await response.json();
      if (data.results && data.results.length > 0) { setResults(data.results); } else { setMessage("No relevant results found."); }
    } catch (err) { setError(err.message); } finally { setIsSearching(false); }
  }, [query]);

  // UPDATED to call the secure backend proxy
  const callGeminiAPI = useCallback(async (prompt) => {
    setIsGenerating(true);
    setError('');
    try {
        const payload = { prompt: prompt };
        const response = await fetch('/gemini-proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.detail || `API call failed with status: ${response.status}`);
        }
        const result = await response.json();
        return result.candidates[0].content.parts[0].text;
    } catch (err) {
        setError(`Failed to generate content: ${err.message}`);
        return null;
    } finally {
        setIsGenerating(false);
    }
  }, []);

  const handleSummarize = useCallback(async () => {
      const context = results.join('\n\n');
      const prompt = `Based on the following text excerpts, provide a concise summary:\n\n${context}`;
      const summary = await callGeminiAPI(prompt);
      if (summary) { setGeminiSummary(summary); }
  }, [results, callGeminiAPI]);

  const handleSuggestQuestions = useCallback(async () => {
      const context = results.join('\n\n');
      const prompt = `Based on the following text, suggest three follow-up questions. Return as a simple list, each on a new line.:\n\n${context}`;
      const suggestions = await callGeminiAPI(prompt);
      if (suggestions) { setGeminiQuestions(suggestions.split('\n').filter(q => q.trim() !== '')); }
  }, [results, callGeminiAPI]);

  return (
    <div className="bg-gray-900 min-h-screen text-white font-sans p-4 sm:p-8 flex flex-col items-center">
      <div className="w-full max-w-3xl">
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">Knowledge Chunker</h1>
          <p className="text-gray-400 mt-4 max-w-xl mx-auto">
            This tool transforms your documents into a searchable knowledge base. 
            Upload a PDF or TXT file, and then ask questions to find the most relevant information instantly.
          </p>
          {/* --- YOUR NAME IS HERE --- */}
          <p className="text-gray-500 mt-4 text-sm">
            Created by Mohammad Sameer
          </p>
        </header>
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 mb-8 shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-gray-200">1. Upload Document</h2>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <label htmlFor="file-upload" className="cursor-pointer bg-gray-700 text-white px-4 py-2 rounded-md border border-gray-600 hover:bg-gray-600 transition-colors w-full sm:w-auto text-center">{fileName || 'Select .pdf or .txt'}</label>
            <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.txt" />
            <button onClick={handleUpload} disabled={isUploading || !file} className="w-full sm:w-auto flex items-center justify-center bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors">{isUploading ? <><Spinner /> Uploading...</> : <><UploadIcon /> Upload & Index</>}</button>
          </div>
        </div>
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 mb-8 shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-gray-200">2. Ask a Question</h2>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="e.g., 'What are the key findings?'" className="flex-grow w-full bg-gray-700 text-white px-4 py-2 rounded-md border border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none"/>
            <button onClick={handleSearch} disabled={isSearching} className="w-full sm:w-auto flex items-center justify-center bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed transition-colors">{isSearching ? <><Spinner /> Searching...</> : <><SearchIcon /> Search</>}</button>
          </div>
        </div>
        <div className="mt-6">
          {error && <div className="bg-red-900/50 text-red-300 p-4 rounded-lg border border-red-700">{error}</div>}
          {message && <div className="bg-blue-900/50 text-blue-300 p-4 rounded-lg border border-blue-700">{message}</div>}
          {results.length > 0 && (
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <button onClick={handleSummarize} disabled={isGenerating} className="flex-1 flex items-center justify-center bg-teal-600 text-white px-6 py-2 rounded-md hover:bg-teal-700 disabled:bg-teal-400 transition-colors">{isGenerating ? <><Spinner/> Summarizing...</> : <>✨ Summarize Results</>}</button>
                    <button onClick={handleSuggestQuestions} disabled={isGenerating} className="flex-1 flex items-center justify-center bg-sky-600 text-white px-6 py-2 rounded-md hover:bg-sky-700 disabled:bg-sky-400 transition-colors">{isGenerating ? <><Spinner/> Generating...</> : <>✨ Suggest Questions</>}</button>
                </div>
                {geminiSummary && (<div className="bg-gray-800 p-4 rounded-lg border border-teal-500 shadow-lg"><h3 className="text-lg font-semibold text-teal-400 mb-2">AI Summary</h3><p className="text-gray-300 whitespace-pre-wrap">{geminiSummary}</p></div>)}
                {geminiQuestions.length > 0 && (<div className="bg-gray-800 p-4 rounded-lg border border-sky-500 shadow-lg"><h3 className="text-lg font-semibold text-sky-400 mb-2">Suggested Questions</h3><ul className="list-disc list-inside text-gray-300 space-y-1">{geminiQuestions.map((q, i) => <li key={i}>{q.replace(/^\d+\.\s*/, '')}</li>)}</ul></div>)}
                {results.map((result, index) => (<ResultCard key={index} text={result} index={index} />))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}