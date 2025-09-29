
import React, { useState, useCallback, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import * as mammoth from 'mammoth';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { FileUpload } from './components/FileUpload';
import { ResultsDisplay } from './components/ResultsDisplay';
import { Footer } from './components/Footer';
import { Spinner } from './components/Spinner';
import { ChatWindow } from './components/ChatWindow';
import { ChatFab } from './components/ChatFab';
import { generateQuestionsFromResume, OpenAIChatSession } from './services/openaiService';
import type { InterviewQuestion, AppState, DifficultyFilter, ChatMessage } from './types';

// Set up the PDF.js worker source from the CDN. This is required for the library to work.
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.mjs`;

/**
 * Extracts text content from a PDF file.
 * @param file The PDF file to parse.
 * @returns A promise that resolves with the extracted text.
 */
const getTextFromPdf = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({
    data: arrayBuffer,
    // Optimize for faster loading
    enableXfa: false,
    isOffscreenCanvasSupported: false
  }).promise;
  
  let fullText = '';
  const numPages = Math.min(pdf.numPages, 5); // Limit to first 5 pages for performance
  
  // Process pages concurrently for better performance
  const pagePromises = [];
  for (let i = 1; i <= numPages; i++) {
    pagePromises.push(
      pdf.getPage(i).then(async (page) => {
        const textContent = await page.getTextContent();
        return textContent.items
          .map(item => ('str' in item ? item.str : ''))
          .join(' ');
      })
    );
  }
  
  const pageTexts = await Promise.all(pagePromises);
  fullText = pageTexts.join('\n');
  
  return fullText;
};

/**
 * Extracts text content from a .docx file using mammoth.js.
 * @param file The .docx file to parse.
 * @returns A promise that resolves with the extracted text.
 */
const getTextFromDocx = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
};


/**
 * The main application component. It manages the application's state,
 * handles file uploads, generates interview questions, and orchestrates
 * the display of results and the chat interface.
 */
const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    status: 'idle',
    resumeText: null,
    fileName: null,
    questions: [],
    error: null,
    difficultyFilter: 'All',
  });
  
  // State for the chat feature
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatSession, setChatSession] = useState<OpenAIChatSession | null>(null);
  
  // State for streaming effect
  const [allGeneratedQuestions, setAllGeneratedQuestions] = useState<InterviewQuestion[]>([]);

  // Effect to "stream" questions one by one after they are fetched
  useEffect(() => {
    if (state.status === 'success' && allGeneratedQuestions.length > 0 && state.questions.length < allGeneratedQuestions.length) {
      const timer = setTimeout(() => {
        setState(prevState => ({
          ...prevState,
          questions: allGeneratedQuestions.slice(0, prevState.questions.length + 1)
        }));
      }, 100); // Adjust delay as needed for desired effect
      return () => clearTimeout(timer);
    }
  }, [state.questions, allGeneratedQuestions, state.status]);


  /**
   * Handles the file selection event. It resets the application state,
   * validates the file type, and extracts text content from the selected file.
   * @param file The file selected by the user. Can be null if selection is cleared.
   */
  const handleFileChange = useCallback(async (file: File | null) => {
    if (!file) {
      handleReset();
      return;
    }

    setState((prevState) => ({ 
      ...prevState, 
      status: 'parsing', 
      fileName: file.name, 
      error: null, 
      questions: [],
      resumeText: null
    }));
    
    // Reset other states
    setAllGeneratedQuestions([]);
    setIsChatVisible(false);
    setChatHistory([]);
    setChatSession(null);


    try {
      let text: string;
      if (file.type === 'text/plain') {
        text = await file.text();
      } else if (file.type === 'application/pdf') {
        text = await getTextFromPdf(file);
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.endsWith('.docx')) {
        text = await getTextFromDocx(file);
      } else {
        throw new Error('Unsupported file type. Please upload a .txt, .pdf, or .docx file.');
      }

      setState((prevState) => ({
        ...prevState,
        resumeText: text,
        fileName: file.name,
        status: 'ready',
      }));
    } catch (err) {
      console.error("File processing error:", err);
      const message = err instanceof Error ? err.message : 'Failed to read or process the file.';
      setState((prevState) => ({
        ...prevState,
        error: message,
        status: 'error',
        fileName: file.name,
        resumeText: null,
      }));
    }
  }, []);

  /**
   * Initiates the question generation process using the extracted resume text.
   * It sets the application status to 'loading', calls the Gemini service,
   * and then updates the state with the generated questions or an error.
   * It also initializes the AI chat session upon success.
   */
  const handleGenerateQuestions = useCallback(async () => {
    if (!state.resumeText) {
      setState((prevState) => ({
        ...prevState,
        error: 'No resume text available to generate questions.',
        status: 'error',
      }));
      return;
    }

    setState((prevState) => ({ ...prevState, status: 'loading', error: null, difficultyFilter: 'All', questions: [] }));
    setAllGeneratedQuestions([]);

    try {
      const generatedQuestions = await generateQuestionsFromResume(state.resumeText);

      setAllGeneratedQuestions(generatedQuestions); // Store all questions
      setState((prevState) => ({
        ...prevState,
        status: 'success', // Start the streaming effect
      }));


      // Initialize the chat session once questions are generated
      const API_KEY = import.meta.env.VITE_OPENAI_API_KEY || 
                      (typeof process !== 'undefined' && process.env?.OPENAI_API_KEY) || 
                      undefined;
      if (API_KEY && state.resumeText) {
        const chat = new OpenAIChatSession(API_KEY, state.resumeText);
        setChatSession(chat);
      }

    } catch (err) {
      console.error("Question generation error:", err);
      const message = err instanceof Error ? err.message : 'An unknown error occurred during question generation.';
       setState((prevState) => ({
        ...prevState,
        error: message,
        status: 'error',
      }));
    }
  }, [state.resumeText]);

  /**
   * Resets the entire application state to its initial 'idle' condition,
   * clearing all data.
   */
  const handleReset = useCallback(() => {
    setState({
      status: 'idle',
      resumeText: null,
      fileName: null,
      questions: [],
      error: null,
      difficultyFilter: 'All',
    });
    setAllGeneratedQuestions([]);
    setIsChatVisible(false);
    setChatHistory([]);
    setChatSession(null);
  }, []);
  
  /**
   * Sets the difficulty filter for the displayed questions.
   * @param filter The difficulty level to filter by.
   */
  const handleFilterChange = useCallback((filter: DifficultyFilter) => {
    setState(prevState => ({ ...prevState, difficultyFilter: filter }));
  }, []);

  /**
   * Toggles the visibility of the chat window.
   */
  const handleToggleChat = useCallback(() => {
    if (chatHistory.length === 0 && state.status === 'success') {
       // Add an initial message from the model when chat is first opened
       setChatHistory([{ role: 'model', text: 'Hello! I see you\'ve generated some questions based on your resume. How can I help you prepare? You can ask for feedback on an answer, or we can discuss one of the questions.' }]);
    }
    setIsChatVisible(prev => !prev);
  }, [chatHistory.length, state.status]);

  /**
   * Handles sending a message in the chat. It updates the chat history
   * and sends the message to the Gemini API for a response.
   * @param message The message text from the user.
   */
  const handleSendMessage = useCallback(async (message: string) => {
    if (!chatSession) return;

    const userMessage: ChatMessage = { role: 'user', text: message };
    // Add user message and a temporary empty model message for the typing indicator
    setChatHistory(prev => [...prev, userMessage, { role: 'model', text: '' }]);
    setIsChatLoading(true);

    try {
      const response = await chatSession.sendMessage(message);
      const modelResponse: ChatMessage = { role: 'model', text: response.text };
      
      // Replace the temporary empty message with the actual response
      setChatHistory(prev => [...prev.slice(0, -1), modelResponse]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: ChatMessage = { role: 'model', text: 'Sorry, I encountered an error. Please try again.' };
      setChatHistory(prev => [...prev.slice(0, -1), errorMessage]);
    } finally {
      setIsChatLoading(false);
    }
  }, [chatSession]);


  const showFileUpload = state.status !== 'idle';
  const showResults = state.status === 'success' || (state.status === 'loading' && state.questions.length > 0);

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: 'var(--font-sans)' }}>
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12 w-full max-w-5xl">
        {!showFileUpload && <Hero onFileUpload={handleFileChange} />}

        {showFileUpload && (
          <FileUpload
            fileName={state.fileName}
            status={state.status}
            onFileChange={handleFileChange}
            onGenerate={handleGenerateQuestions}
            onReset={handleReset}
          />
        )}
        
        {state.status === 'loading' && (
          <div className="text-center py-12">
            <Spinner />
            <p className="mt-4 text-lg text-slate-300">Analyzing your resume and crafting questions...</p>
          </div>
        )}

        {state.error && (
          <div className="mt-6 bg-red-200 border-l-4 border-red-600 text-red-800 p-4 rounded-md shadow-md" role="alert" style={{ backgroundColor: 'var(--paper-bg)'}}>
            <p className="font-bold">An Error Occurred</p>
            <p>{state.error}</p>
          </div>
        )}

        {showResults && (
           <ResultsDisplay 
             questions={state.questions} 
             activeFilter={state.difficultyFilter} 
             onFilterChange={handleFilterChange}
             isFinishedLoading={allGeneratedQuestions.length > 0 && allGeneratedQuestions.length === state.questions.length}
           />
        )}
        
        {/* Chat feature UI */}
        {state.status === 'success' && !isChatVisible && (
          <ChatFab onClick={handleToggleChat} />
        )}

        {isChatVisible && (
          <ChatWindow 
            history={chatHistory}
            isLoading={isChatLoading}
            onSendMessage={handleSendMessage}
            onClose={handleToggleChat}
          />
        )}

      </main>
      <Footer />
    </div>
  );
};

export default App;