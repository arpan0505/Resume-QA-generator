
import React from 'react';
import type { AppStatus } from '../types';

/**
 * Props for the FileUpload component.
 */
interface FileUploadProps {
  /** The name of the currently selected file. */
  fileName: string | null;
  /** The current status of the application. */
  status: AppStatus;
  /** Callback for when a new file is selected. */
  onFileChange: (file: File | null) => void;
  /** Callback to trigger the question generation process. */
  onGenerate: () => void;
  /** Callback to reset the application state. */
  onReset: () => void;
}

/**
 * A reusable file icon component.
 */
const FileIcon: React.FC = () => (
  <svg className="w-6 h-6 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
);

/**
 * Renders the file upload and control bar that appears after a file
 * has been selected. It shows the file name, status, and provides
 * controls to change the file, generate questions, or reset.
 */
export const FileUpload: React.FC<FileUploadProps> = ({ fileName, status, onFileChange, onGenerate, onReset }) => {
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
     onFileChange(e.target.files ? e.target.files[0] : null);
  };
  
  return (
    <div 
        className="p-6 transition-all duration-300"
        style={{
            backgroundColor: 'var(--paper-bg)',
            boxShadow: '3px 5px 15px rgba(0,0,0,0.4)',
            transform: 'rotate(-0.5deg)',
            color: 'var(--desk-ink)',
            border: '1px solid #e8e3d6',
        }}
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4" style={{transform: 'rotate(0.5deg)'}}>
        <div className="flex items-center gap-4">
          <FileIcon />
          <div className="flex-grow">
            <p className="font-semibold text-stone-800">{fileName || 'No file selected'}</p>
            <p className="text-sm text-stone-600">
              {status === 'error' && 'Please select a valid .txt, .pdf, or .docx file.'}
              {status === 'parsing' && 'Reading document...'}
              {status === 'ready' && 'Ready to generate questions.'}
              {status === 'loading' && 'Generating...'}
              {status === 'success' && 'Generation complete.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <label htmlFor="file-upload-change" className="cursor-pointer text-sm bg-stone-200 hover:bg-stone-300 text-stone-700 font-semibold py-2 px-4 rounded-md transition duration-200 border border-stone-400">
            Change File
          </label>
          <input id="file-upload-change" type="file" className="hidden" accept=".txt,.pdf,.docx" onChange={handleFileSelect} />

          <button
            onClick={onGenerate}
            disabled={status !== 'ready'}
            className="text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-md transition duration-200 shadow"
          >
            {status === 'loading' ? 'Generating...' : 'Generate Q&A'}
          </button>
           <button
            onClick={onReset}
            className="text-sm bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition duration-200"
          >
           Reset
          </button>
        </div>
      </div>
    </div>
  );
};