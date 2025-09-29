
import React from 'react';
import type { InterviewQuestion } from '../types';
import { QuestionDifficulty } from '../types';

/**
 * Props for the QuestionCard component.
 */
interface QuestionCardProps {
  /** The interview question object to display. */
  question: InterviewQuestion;
}

/**
* Determines the Tailwind CSS classes for the difficulty badge based on the question's difficulty level.
* @param difficulty The difficulty level of the question.
* @returns A string of CSS classes.
*/
const getDifficultyClass = (difficulty: QuestionDifficulty) => {
  switch (difficulty) {
    case QuestionDifficulty.Easy:
      return 'bg-[var(--highlight-green)]';
    case QuestionDifficulty.Medium:
      return 'bg-[var(--highlight-yellow)]';
    case QuestionDifficulty.Hard:
      return 'bg-[var(--highlight-red)]';
    default:
      return 'bg-stone-200';
  }
};

/**
 * Renders a single interview question in a card format, including its
 * category, difficulty, the question itself, and a collapsible answer guideline.
 */
export const QuestionCard: React.FC<QuestionCardProps> = ({ question }) => {
  return (
    <div className="relative bg-[#fefcf6] rounded-md border border-stone-300 overflow-hidden transition-all duration-300 hover:shadow-md"
        style={{
             backgroundImage: 'linear-gradient(to right, rgba(255, 150, 150, 0.3) 1px, transparent 1px)',
             backgroundSize: '30px 100%',
             backgroundPosition: '2rem 0',
        }}
    >
      <div className="absolute top-0 left-0 bottom-0 w-8 bg-transparent"
        style={{
            borderRight: '1.5px solid rgba(255, 150, 150, 0.5)',
        }}
      ></div>
      <div className="p-5 pl-12">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-3">
          <p className="text-sm font-semibold text-blue-700 mb-2 sm:mb-0">
            {question.category}
          </p>
          <span className={`px-2 py-0.5 text-xs font-bold rounded-sm ${getDifficultyClass(question.difficulty)}`}>
            {question.difficulty}
          </span>
        </div>

        <h4 className="text-lg font-semibold text-stone-800 mb-3" style={{ fontFamily: 'var(--font-serif)' }}>
          {question.question}
        </h4>

        <div>
           <details className="group">
                <summary className="cursor-pointer text-sm font-medium text-stone-500 hover:text-stone-800">
                    Show Ideal Answer
                </summary>
                <div className="mt-3 pt-3 border-t border-[var(--paper-lines)]">
                    <p className="text-stone-700 leading-relaxed text-sm whitespace-pre-line">
                        {question.answer_guideline}
                    </p>
                </div>
            </details>
        </div>
      </div>
    </div>
  );
};