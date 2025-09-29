
import type { InterviewQuestion } from './types';
import { QuestionDifficulty } from './types';

/**
 * A set of mock interview questions used for development, testing,
 * or as a fallback.
 */
export const MOCK_QUESTIONS: InterviewQuestion[] = [
  {
    question: "Can you walk me through your experience with React and state management libraries like Redux?",
    answer_guideline: "Candidate should explain their hands-on experience with React, detailing specific projects. They should be able to articulate the purpose of state management, the problems Redux solves, and mention concepts like actions, reducers, and the store. Bonus points for mentioning alternatives like Context API, Zustand, or MobX and their trade-offs.",
    category: "Technical Skills: Frontend",
    difficulty: QuestionDifficulty.Medium,
  },
  {
    question: "Tell me about a challenging project you worked on. What was your role, and how did you overcome the challenges?",
    answer_guideline: "Look for a clear description of the project and the problem (STAR method: Situation, Task, Action, Result). The candidate should specify their individual contribution and demonstrate problem-solving skills, collaboration, and resilience. The outcome should be measurable and positive.",
    category: "Behavioral & Project Experience",
    difficulty: QuestionDifficulty.Medium,
  },
  {
    question: "Based on your resume, you have experience with both SQL and NoSQL databases. When would you choose one over the other?",
    answer_guideline: "A strong answer will highlight the core differences: SQL for structured data with predefined schemas and ACID compliance (e.g., financial transactions), and NoSQL for unstructured or semi-structured data, scalability, and flexibility (e.g., user profiles, IoT data). They should provide practical examples relevant to their past projects.",
    category: "Technical Skills: Backend & Databases",
    difficulty: QuestionDifficulty.Hard,
  },
  {
    question: "Describe how you would optimize a slow-loading web page.",
    answer_guideline: "Candidate should mention a variety of techniques across the stack, such as optimizing images (compression, modern formats), minifying CSS/JS, using a CDN, enabling browser caching, code splitting, lazy loading components/images, and potentially backend optimizations like database query improvements or server-side rendering.",
    category: "Technical Skills: Performance",
    difficulty: QuestionDifficulty.Hard,
  },
    {
    question: "What is the difference between `let`, `const`, and `var` in JavaScript?",
    answer_guideline: "Candidate should explain that `var` is function-scoped and hoisted, while `let` and `const` are block-scoped. `const` variables cannot be reassigned after declaration, whereas `let` variables can. They should also mention that `let` and `const` are not hoisted in the same way as `var`, leading to a 'temporal dead zone'.",
    category: "Technical Skills: Core Language",
    difficulty: QuestionDifficulty.Easy,
  },
];
