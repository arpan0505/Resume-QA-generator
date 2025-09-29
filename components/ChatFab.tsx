
import React from 'react';

interface ChatFabProps {
  onClick: () => void;
}

const ChatIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18zM18 14H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
  </svg>
);


export const ChatFab: React.FC<ChatFabProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-8 right-8 bg-red-600 hover:bg-red-700 text-white font-bold p-4 rounded-full transition duration-300 ease-in-out transform hover:scale-110 shadow-lg z-40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-gray-800"
      aria-label="Start AI Career Coach"
      title="Start AI Career Coach"
    >
      <ChatIcon />
    </button>
  );
};