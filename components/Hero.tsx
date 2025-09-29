
import React, { useRef } from 'react';

/**
 * Props for the Hero component.
 */
interface HeroProps {
  /**
   * Callback function triggered when a file is uploaded.
   * @param file The uploaded file object.
   */
  onFileUpload: (file: File) => void;
}

/**
 * Renders the main hero section of the page, which includes the
 * main call-to-action for uploading a resume.
 */
export const Hero: React.FC<HeroProps> = ({ onFileUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  return (
    <div className="text-center py-16 md:py-24">
      <h2 className="text-4xl md:text-5xl text-slate-100 mb-4" style={{ fontFamily: 'var(--font-serif)', textShadow: '1px 1px 3px rgba(0,0,0,0.4)' }}>
        Turn Your Resume into an Interview
      </h2>
      <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto mb-8">
        Place your resume on the desk. Our AI will instantly generate tailored interview questions, helping you prepare for your next big opportunity.
      </p>
      <div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".txt,.pdf,.docx"
        />
        <button
          onClick={handleButtonClick}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-md text-lg transition-all duration-200 ease-in-out border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 shadow-lg"
        >
          Upload Your Resume
        </button>
      </div>
       <p className="mt-4 text-sm text-slate-400">
        Please use a plain text (.txt), PDF (.pdf), or Word (.docx) file.
      </p>
    </div>
  );
};