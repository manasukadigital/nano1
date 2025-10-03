
import React from 'react';
import { ImageIcon } from './icons';

interface ResultDisplayProps {
  image: string | null;
  text: string | null;
  isLoading: boolean;
  hasInput: boolean;
}

const LoadingSpinner: React.FC = () => (
    <div className="flex flex-col items-center justify-center gap-4 text-yellow-400">
        <svg className="animate-spin h-12 w-12 text-yellow-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-lg font-semibold animate-pulse">Your masterpiece is being created...</p>
    </div>
);


export const ResultDisplay: React.FC<ResultDisplayProps> = ({ image, text, isLoading, hasInput }) => {
  const renderContent = () => {
    if (isLoading) {
      return <LoadingSpinner />;
    }

    if (image) {
      return (
        <div className="flex flex-col items-center gap-4 w-full h-full">
            <img src={image} alt="Generated result" className="w-full h-auto max-h-[70vh] object-contain rounded-lg shadow-2xl" />
            {text && <p className="mt-4 p-4 bg-gray-900 rounded-lg text-gray-300 italic w-full">{text}</p>}
        </div>
      );
    }

    return (
        <div className="flex flex-col items-center justify-center gap-4 text-gray-500">
            <ImageIcon />
            <p className="text-lg font-semibold text-center">
              {hasInput ? "Your generated image will appear here." : "Upload an image to get started."}
            </p>
        </div>
    );
  };
  
  return (
    <div className="w-full h-full min-h-[300px] bg-gray-900/50 border border-gray-700 rounded-xl flex items-center justify-center p-4">
        {renderContent()}
    </div>
  );
};
