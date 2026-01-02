
import React, { useRef } from 'react';
import { ImageData } from '../types';

interface ImageUploaderProps {
  label: string;
  onImageSelect: (data: ImageData | null) => void;
  currentImage: ImageData | null;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ label, onImageSelect, currentImage }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        onImageSelect({
          base64: base64String,
          mimeType: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center w-full">
      <span className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">{label}</span>
      <div 
        onClick={triggerUpload}
        className={`relative w-full aspect-[3/4] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-300 overflow-hidden
          ${currentImage ? 'border-transparent bg-black' : 'border-gray-200 hover:border-black bg-white'}
        `}
      >
        {currentImage ? (
          <>
            <img 
              src={`data:${currentImage.mimeType};base64,${currentImage.base64}`} 
              alt={label} 
              className="w-full h-full object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-black/20 hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
               <span className="text-white text-sm font-medium">Change Photo</span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center space-y-2 px-4 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm text-gray-500 font-medium">Click to upload</span>
          </div>
        )}
      </div>
      <input 
        type="file" 
        className="hidden" 
        accept="image/*" 
        ref={fileInputRef} 
        onChange={handleFileChange}
      />
      {currentImage && (
        <button 
          onClick={(e) => { e.stopPropagation(); onImageSelect(null); }}
          className="mt-3 text-xs text-red-500 hover:text-red-700 transition-colors"
        >
          Remove
        </button>
      )}
    </div>
  );
};

export default ImageUploader;
