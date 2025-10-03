
import React, { useState, useCallback } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { ResultDisplay } from './components/ResultDisplay';
import { editImage, fileToBase64 } from './services/geminiService';
import { BananaIcon } from './components/icons';

const Header: React.FC = () => (
  <header className="w-full text-center py-6">
    <h1 className="text-4xl md:text-5xl font-bold text-white flex items-center justify-center gap-3">
      <BananaIcon />
      Nano Banana Image Editor
    </h1>
    <p className="text-lg text-gray-400 mt-2">Edit images with the power of Gemini AI</p>
  </header>
);

const App: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [resultText, setResultText] = useState<string | null>(null);

  const handleImageSelect = useCallback((file: File) => {
    setImageFile(file);
    setResultImage(null);
    setResultText(null);
    setError(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(URL.createObjectURL(file));
  }, [previewUrl]);

  const handleSubmit = async () => {
    if (!imageFile || !prompt) {
      setError("Please select an image and enter a prompt.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResultImage(null);
    setResultText(null);

    try {
      const base64Image = await fileToBase64(imageFile);
      const result = await editImage(base64Image, imageFile.type, prompt);
      
      setResultImage(result.image);
      setResultText(result.text);

    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
        setError(errorMessage);
        console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const isGenerateDisabled = isLoading || !imageFile || !prompt;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 sm:p-6">
      <Header />
      <main className="w-full max-w-7xl flex-grow container mx-auto p-4 rounded-xl bg-gray-800/50 shadow-2xl ring-1 ring-white/10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
          {/* Input Panel */}
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-semibold text-white border-b-2 border-yellow-400 pb-2">1. Your Canvas</h2>
            <ImageUploader onImageSelect={handleImageSelect} previewUrl={previewUrl} />
            <div className="flex flex-col gap-2">
               <label htmlFor="prompt" className="text-lg font-medium">2. Your Magic Words</label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., 'add a futuristic city in the background', 'make it a cubist painting', 'add a happy llama next to the person'"
                className="w-full h-32 p-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:outline-none transition-shadow"
                disabled={isLoading}
              />
            </div>
            <button
              onClick={handleSubmit}
              disabled={isGenerateDisabled}
              className={`w-full py-3 px-6 text-lg font-bold rounded-lg transition-all duration-300 flex items-center justify-center gap-2
                ${isGenerateDisabled 
                  ? 'bg-gray-600 cursor-not-allowed' 
                  : 'bg-yellow-500 hover:bg-yellow-400 text-gray-900 transform hover:scale-105 shadow-lg hover:shadow-yellow-400/30'
                }`}
            >
              Generate
            </button>
          </div>

          {/* Output Panel */}
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-semibold text-white border-b-2 border-yellow-400 pb-2">3. The Masterpiece</h2>
             {error && (
                <div className="bg-red-900/50 border border-red-500 text-red-300 p-4 rounded-lg">
                  <p className="font-bold">An error occurred:</p>
                  <p>{error}</p>
                </div>
              )}
            <ResultDisplay 
                image={resultImage} 
                text={resultText} 
                isLoading={isLoading} 
                hasInput={!!imageFile}
            />
          </div>
        </div>
      </main>
      <footer className="text-center py-4 text-gray-500 text-sm mt-4">
        Powered by Google Gemini.
      </footer>
    </div>
  );
};

export default App;
