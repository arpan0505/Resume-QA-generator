
import React from 'react';
import type { InterviewQuestion, DifficultyFilter } from '../types';
import { QuestionDifficulty } from '../types';
import { QuestionCard } from './QuestionCard';
import { Spinner } from './Spinner';

/**
 * Props for the ResultsDisplay component.
 */
interface ResultsDisplayProps {
  /** The array of generated interview questions. */
  questions: InterviewQuestion[];
  /** The currently active difficulty filter. */
  activeFilter: DifficultyFilter;
  /** Callback to change the active difficulty filter. */
  onFilterChange: (filter: DifficultyFilter) => void;
  /** A boolean to indicate if all questions have finished 'streaming' in. */
  isFinishedLoading: boolean;
}

const FILTERS: DifficultyFilter[] = ['All', QuestionDifficulty.Easy, QuestionDifficulty.Medium, QuestionDifficulty.Hard];

/**
 * Displays the generated interview questions, including filtering controls
 * and the list of question cards.
 */
export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ questions, activeFilter, onFilterChange, isFinishedLoading }) => {
  const filteredQuestions = questions.filter(q => 
    activeFilter === 'All' || q.difficulty === activeFilter
  );

  const getButtonClass = (filter: DifficultyFilter) => {
    const baseClass = 'px-4 py-2 text-sm font-semibold rounded-t-lg transition-all duration-200 focus:outline-none -mb-px border';
    if (filter === activeFilter) {
      return `${baseClass} bg-[var(--paper-bg)] text-blue-600 border-stone-300 border-b-[var(--paper-bg)]`;
    }
    return `${baseClass} bg-stone-200 text-stone-600 hover:bg-stone-300 border-stone-300 border-b-stone-300`;
  };

  return (
    <div className="mt-12">
      <div className="flex flex-col md:flex-row justify-between md:items-end mb-0 gap-4">
        <h3 className="text-3xl md:text-4xl text-slate-100" style={{ fontFamily: 'var(--font-serif)', textShadow: '1px 1px 3px rgba(0,0,0,0.4)' }}>
          Generated Questions
        </h3>
        <div className="flex items-center space-x-1">
          {FILTERS.map(filter => (
            <button 
              key={filter}
              onClick={() => onFilterChange(filter)}
              className={getButtonClass(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>
      
      <div className="space-y-6 bg-[var(--paper-bg)] p-6 border border-stone-300 rounded-b-lg rounded-tr-lg" style={{ boxShadow: '3px 5px 15px rgba(0,0,0,0.4)'}}>
        {filteredQuestions.map((q, index) => (
          <QuestionCard key={index} question={q} />
        ))}
         {!isFinishedLoading && (
            <div className="mt-8 text-center text-stone-500">
                <Spinner />
                <p className="mt-2 text-sm">Generating more questions...</p>
            </div>
         )}
         {isFinishedLoading && filteredQuestions.length === 0 && (
             <div className="text-center py-12 px-6">
                <svg className="mx-auto h-12 w-12 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-stone-900">No questions found</h3>
                <p className="mt-1 text-sm text-stone-500">
                  There are no questions matching the "{activeFilter}" difficulty level.
                </p>
              </div>
          )}
      </div>
    </div>
  );
};