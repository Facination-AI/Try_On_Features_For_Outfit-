
import React, { useState, useCallback } from 'react';
import ImageUploader from './components/ImageUploader';
import { ImageData, GenerationResult } from './types';
import { generateTryOn, editImageWithText } from './services/geminiService';

const App: React.FC = () => {
  const [userImage, setUserImage] = useState<ImageData | null>(null);
  const [outfitImage, setOutfitImage] = useState<ImageData | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTryOn = async () => {
    if (!userImage || !outfitImage) {
      setError("Please upload both your photo and an outfit photo.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const genResult = await generateTryOn(userImage, outfitImage, prompt);
      setResult(genResult);
      // Clean up prompt after use if it was just for the try-on
      setPrompt('');
    } catch (err: any) {
      setError(err.message || "Something went wrong during generation.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!result?.imageUrl && !userImage) {
      setError("Please provide an image to edit (upload your photo or generate a try-on first).");
      return;
    }
    if (!prompt) {
      setError("Please enter an edit instruction (e.g., 'Add a retro filter').");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Use result if it exists, otherwise use the user image
      const sourceImage = result ? {
        base64: result.imageUrl.split(',')[1],
        mimeType: result.imageUrl.split(',')[0].split(':')[1].split(';')[0]
      } : userImage!;

      const editResult = await editImageWithText(sourceImage, prompt);
      setResult(editResult);
      setPrompt('');
    } catch (err: any) {
      setError(err.message || "Failed to edit image.");
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setUserImage(null);
    setOutfitImage(null);
    setResult(null);
    setPrompt('');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-900 px-6 py-12 md:py-20 flex flex-col items-center">
      {/* Header */}
      <header className="max-w-4xl w-full mb-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Vogue<span className="text-indigo-600">AI</span></h1>
        <p className="text-gray-500 font-light text-lg">Virtual try-on powered by Gemini 2.5 Flash</p>
      </header>

      <main className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Column: Inputs */}
        <div className="lg:col-span-5 space-y-10">
          <div className="grid grid-cols-2 gap-4">
            <ImageUploader 
              label="Your Photo" 
              onImageSelect={setUserImage} 
              currentImage={userImage} 
            />
            <ImageUploader 
              label="Outfit" 
              onImageSelect={setOutfitImage} 
              currentImage={outfitImage} 
            />
          </div>

          <div className="space-y-4">
            <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 block">
              Instructions (Optional)
            </label>
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Add a retro filter, make the background a luxury studio..."
              className="w-full bg-white border border-gray-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none h-24"
            />
          </div>

          <div className="flex flex-col space-y-3">
            <button 
              onClick={handleTryOn}
              disabled={loading || !userImage || !outfitImage}
              className={`w-full py-4 rounded-2xl font-semibold text-sm tracking-wide transition-all shadow-lg
                ${loading || !userImage || !outfitImage 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-black text-white hover:bg-gray-800 active:scale-[0.98]'
                }
              `}
            >
              {loading ? 'Thinking...' : 'Try On'}
            </button>
            
            <button 
              onClick={handleEdit}
              disabled={loading || !prompt || (!result && !userImage)}
              className={`w-full py-4 rounded-2xl font-semibold text-sm tracking-wide transition-all border
                ${loading || !prompt || (!result && !userImage)
                  ? 'bg-white text-gray-300 border-gray-100 cursor-not-allowed' 
                  : 'bg-white text-indigo-600 border-indigo-100 hover:border-indigo-200 hover:bg-indigo-50 active:scale-[0.98]'
                }
              `}
            >
              Apply Edit Only
            </button>

            {(userImage || outfitImage || result) && (
              <button 
                onClick={resetAll}
                className="text-gray-400 text-xs hover:text-red-500 transition-colors self-center mt-4"
              >
                Clear All
              </button>
            )}
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 animate-in fade-in slide-in-from-top-2 duration-300">
              {error}
            </div>
          )}
        </div>

        {/* Right Column: Result */}
        <div className="lg:col-span-7 h-full flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3 block lg:text-center">Result Preview</span>
          <div className="relative bg-white border border-gray-100 rounded-[2rem] shadow-2xl overflow-hidden aspect-[4/5] flex items-center justify-center group">
            {result ? (
              <>
                <img 
                  src={result.imageUrl} 
                  alt="Result" 
                  className={`w-full h-full object-cover transition-all duration-700 ${loading ? 'scale-105 blur-sm opacity-50' : 'scale-100 blur-0 opacity-100'}`}
                />
                <a 
                  href={result.imageUrl} 
                  download="vogue-ai-try-on.png"
                  className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-md p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </a>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-12 space-y-6">
                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <h3 className="text-gray-900 font-medium">Ready for your transformation?</h3>
                  <p className="text-gray-400 text-sm max-w-xs mx-auto">Upload your photos and click 'Try On' to see the magic happen.</p>
                </div>
              </div>
            )}

            {loading && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-500">
                <div className="w-12 h-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="text-sm font-medium text-indigo-600 animate-pulse tracking-wide">Processing Image...</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="mt-24 text-center">
        <div className="flex items-center justify-center space-x-6 mb-8 opacity-30">
          <span className="h-px w-12 bg-gray-400"></span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">AI Fashion Technology</span>
          <span className="h-px w-12 bg-gray-400"></span>
        </div>
        <p className="text-gray-400 text-xs">Generated images may vary in realism. This app uses Gemini 2.5 Flash for image synthesis.</p>
      </footer>
    </div>
  );
};

export default App;
