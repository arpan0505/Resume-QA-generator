
import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';

/**
 * Props for the ChatWindow component.
 */
interface ChatWindowProps {
  /** The history of chat messages to display. */
  history: ChatMessage[];
  /** A boolean indicating if the chat is waiting for a response. */
  isLoading: boolean;
  /** Callback function to send a new message. */
  onSendMessage: (message: string) => void;
  /** Callback function to close the chat window. */
  onClose: () => void;
}

/**
 * A simple component to render basic markdown (bold, italics, lists, inline code, and code blocks).
 * @param props The component props.
 * @param props.text The string containing markdown to render.
 */
const MarkdownRenderer: React.FC<{ text: string }> = ({ text }) => {
  const elements: React.ReactNode[] = [];
  const lines = text.split('\n');
  let inCodeBlock = false;
  let codeBlockContent: string[] = [];

  const processInline = (line: string): string => {
    return line
      .replace(
        /`(.*?)`/g,
        '<code class="bg-stone-200 rounded px-1 py-0.5 font-mono text-sm">$1</code>'
      )
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');
  };

  lines.forEach((line, index) => {
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // End of code block
        elements.push(
          <pre key={`code-${index}`} className="bg-stone-100 my-2 p-3 rounded-md overflow-x-auto border border-stone-300">
            <code className="text-sm font-mono text-stone-800">
              {codeBlockContent.join('\n')}
            </code>
          </pre>
        );
        codeBlockContent = [];
        inCodeBlock = false;
      } else {
        // Start of code block
        inCodeBlock = true;
      }
    } else if (inCodeBlock) {
      codeBlockContent.push(line);
    } else {
      // Not in a code block, process as a regular paragraph
      let processedLine = processInline(line);

      // Handle bullet points
      if (processedLine.trim().startsWith('* ')) {
        processedLine = `• ${processedLine.trim().substring(2)}`;
      } else if (processedLine.trim().startsWith('- ')) {
        processedLine = `• ${processedLine.trim().substring(2)}`;
      }
      
      elements.push(<p key={index} dangerouslySetInnerHTML={{ __html: processedLine || '&nbsp;' }} />);
    }
  });

  // If a code block was not closed at the end
  if (inCodeBlock && codeBlockContent.length > 0) {
    elements.push(
      <pre key="code-final" className="bg-stone-100 my-2 p-3 rounded-md overflow-x-auto border border-stone-300">
        <code className="text-sm font-mono text-stone-800">
          {codeBlockContent.join('\n')}
        </code>
      </pre>
    );
  }

  return <>{elements}</>;
};

/** A reusable close icon component. */
const CloseIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

/** A reusable send icon component. */
const SendIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
    </svg>
);

/** A reusable typing indicator animation. */
const TypingIndicator: React.FC = () => (
    <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-stone-500 rounded-full animate-pulse"></div>
        <div className="w-2 h-2 bg-stone-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-2 h-2 bg-stone-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
    </div>
);

/**
 * Renders the chat interface for the AI Career Coach, including the message
 * history, input field, and controls.
 */
export const ChatWindow: React.FC<ChatWindowProps> = ({ history, isLoading, onSendMessage, onClose }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    setTimeout(scrollToBottom, 100);
  }, [history]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
        onClick={onClose}
    >
        <div 
            className="w-full max-w-2xl bg-[var(--paper-bg)] rounded-lg flex flex-col relative overflow-hidden border-t-8 border-stone-500"
            style={{
                boxShadow: '5px 8px 25px rgba(0,0,0,0.5)',
            }}
            onClick={(e) => e.stopPropagation()}
        >
          {/* Spiral Binding Effect */}
          <div className="absolute top-2 left-0 right-0 flex justify-center space-x-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="w-4 h-4 rounded-full bg-stone-200 border border-stone-400" />
            ))}
          </div>

          {/* Header */}
          <div className="flex justify-between items-center p-4 pt-10 border-b-2 border-dashed border-stone-300 flex-shrink-0">
            <h3 className="text-xl md:text-2xl text-stone-800" style={{fontFamily: 'var(--font-serif)'}}>
              AI Career Coach
            </h3>
            <button 
              onClick={onClose} 
              className="text-stone-400 hover:text-stone-600 transition-colors"
              aria-label="Close chat"
            >
              <CloseIcon />
            </button>
          </div>

          {/* Messages */}
          <div 
            className="h-96 overflow-y-auto p-4 space-y-4"
            style={{
                backgroundSize: '100% 2em',
                backgroundImage: 'linear-gradient(to bottom, transparent 1.9em, var(--paper-lines) 1.9em, var(--paper-lines) 2em)',
                lineHeight: '2em',
            }}
          >
            {history.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-md lg:max-w-lg px-4 py-1 rounded-lg shadow-sm ${msg.role === 'user' ? 'bg-blue-100 border border-blue-200' : 'bg-stone-100 border border-stone-200'}`}>
                  <div className="text-sm prose prose-p:my-1 text-stone-800" style={{lineHeight: '1.5rem'}}>
                     { (isLoading && index === history.length - 1 && msg.text.length === 0) 
                        ? <TypingIndicator /> 
                        : <MarkdownRenderer text={msg.text} />
                     }
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <div className="p-4 border-t border-stone-300 flex-shrink-0 bg-stone-50">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a follow-up question..."
                className="flex-grow px-4 py-2 bg-white border border-stone-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                disabled={isLoading}
                aria-label="Chat input"
              />
              <button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold p-3 rounded-full transition duration-200 shadow flex items-center justify-center" 
                disabled={isLoading || !input.trim()}
                aria-label="Send message"
              >
                <SendIcon />
              </button>
            </form>
          </div>
        </div>
    </div>
  );
};