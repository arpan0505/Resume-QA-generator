import OpenAI from 'openai';
import type { InterviewQuestion } from '../types';
import { QuestionDifficulty } from '../types';

/**
 * Generates interview questions from resume text using the OpenAI API.
 * @param resumeText The text content of the user's resume.
 * @returns A promise that resolves to an array of InterviewQuestion objects.
 * @throws An error if the API key is not configured or if the API call fails.
 */
export const generateQuestionsFromResume = async (resumeText: string): Promise<InterviewQuestion[]> => {
  // For Vite, environment variables need VITE_ prefix to be accessible in browser
  const API_KEY = import.meta.env.VITE_OPENAI_API_KEY || 
                  (typeof process !== 'undefined' && process.env?.OPENAI_API_KEY) || 
                  undefined;
  
  if (!API_KEY) {
      throw new Error("OpenAI API key is not configured. Please set the VITE_OPENAI_API_KEY environment variable.");
  }

  // Initialize the OpenAI client
  const openai = new OpenAI({
    apiKey: API_KEY,
    dangerouslyAllowBrowser: true // Allow browser usage for client-side apps
  });

  try {
    const systemPrompt = `
      You are an expert technical recruiter and hiring manager with 20 years of experience at top-tier tech companies. Your task is to generate a structured list of highly specific and insightful interview questions based on a candidate's resume.

      **Core Instructions:**
      1.  **Deep Resume Analysis:** Scrutinize the provided resume text for technologies, projects, responsibilities, and career progression. Your questions MUST be directly tied to the content of the resume. Avoid generic questions.
      2.  **Question Specificity:** Instead of "Tell me about a project," ask "On project 'X', you used 'Y' technology. Can you explain the architecture and the specific challenges you faced with 'Y'?"
      3.  **Difficulty Levels:**
          -   **Easy:** Foundational, definition-based questions to verify claims on the resume (e.g., "What is a closure in JavaScript?").
          -   **Medium:** Deeper-dive questions about specific projects or experiences mentioned (e.g., "Walk me through your contribution to the '...' feature on your resume.").
          -   **Hard:** Challenging, scenario-based questions that probe for depth, architectural understanding, trade-off analysis, or potential gaps/weaknesses in the resume (e.g., "You list both 'A' and 'B' databases. If you were to rebuild that system today, would you make the same choice? Justify the trade-offs.").
      4.  **High-Quality Answer Guidelines (Crucial Change):** For EACH question, provide a detailed \`answer_guideline\`. This guideline MUST be a **complete, well-articulated sample answer** written from the first-person perspective of an ideal candidate. It should be the exact answer a top-tier candidate would give in an interview.
          -   **DO NOT** write instructions like "I should explain...".
          -   **INSTEAD**, write the full answer directly. For example:
              -   **For a behavioral question:** "Certainly. In my previous role at Acme Corp, we faced a critical challenge where our user engagement had dropped by 20% (Situation). My task was to lead the redesign of the user dashboard to make it more intuitive (Task). I started by conducting user research and then spearheaded a migration to React with a new component library, which I personally architected (Action). As a result, we successfully increased user session time by 35% and received overwhelmingly positive feedback, which was a huge win for the team (Result)."
              -   **For a technical question:** "A closure in JavaScript is a function that has access to its outer function's scope, even after the outer function has returned. This means it can 'remember' the environment in which it was created. For instance, in a project I worked on, I used closures to create private variables in a module pattern, which helped encapsulate state and prevent naming collisions in the global scope."
          -   The answer should be confident, clear, and directly address the question, seamlessly integrating examples and metrics where appropriate.
      
      Please generate interview questions based on the provided resume text and return them in the following JSON structure:
      {
        "questions": [
          {
            "question": "string",
            "answer_guideline": "string",
            "category": "string",
            "difficulty": "Easy" | "Medium" | "Hard"
          }
        ]
      }
      
      The "questions" array must contain a balanced mix of difficulties, totaling 15-20 questions:
      - 4-6 "Easy" questions.
      - 8-10 "Medium" questions.
      - 3-4 "Hard" questions.
    `;

    const userPrompt = `
      Please generate the interview questions based on the following resume text:
      ---
      ${resumeText}
      ---
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using GPT-4o-mini for faster and cheaper responses
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user", 
          content: userPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000, // Limit response length to prevent truncation
      response_format: { type: "json_object" } // Ensure JSON output
    });

    const jsonText = response.choices[0]?.message?.content;
    if (!jsonText) {
      throw new Error("No response received from OpenAI API");
    }
    
    console.log("Raw OpenAI response length:", jsonText.length);
    console.log("Raw OpenAI response (first 500 chars):", jsonText.substring(0, 500));
    
    let result;
    try {
      result = JSON.parse(jsonText);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      console.error("Invalid JSON response:", jsonText);
      throw new Error(`Invalid JSON response from OpenAI: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
    }
    const questions = result.questions as InterviewQuestion[];
    
    if (!Array.isArray(questions)) {
      throw new Error("API did not return a valid array of questions in the 'questions' property.");
    }
    
    // Validate question structure
    for (const question of questions) {
      if (!question.question || !question.answer_guideline || !question.category || !question.difficulty) {
        throw new Error("Invalid question structure received from API");
      }
      if (!Object.values(QuestionDifficulty).includes(question.difficulty as QuestionDifficulty)) {
        throw new Error(`Invalid difficulty level: ${question.difficulty}`);
      }
    }
    
    return questions;

  } catch (error) {
    console.error("Error generating questions from OpenAI API:", error);
    
    // Log more details for debugging
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    
    if (error instanceof Error && error.message.includes('API key')) {
        throw error;
    }
    
    // Provide more specific error message
    if (error instanceof Error) {
      throw new Error(`OpenAI API Error: ${error.message}`);
    }
    
    throw new Error("Failed to generate interview questions. Please check your API key and try again.");
  }
};

/**
 * Creates a chat session for ongoing conversation about the resume and questions.
 * This replaces the Gemini chat functionality with OpenAI.
 */
export class OpenAIChatSession {
  private openai: OpenAI;
  private messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];
  
  constructor(apiKey: string, resumeText: string) {
    this.openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true
    });
    
    // Initialize with system message
    this.messages.push({
      role: "system",
      content: `You are an expert career coach and interview assistant. You are having a conversation with a candidate about their resume and the interview questions that were just generated. The user's resume is provided below. Your role is to discuss the questions, help the user practice their answers, and provide constructive feedback to improve their resume. Be supportive, insightful, and professional. Use basic markdown for formatting (bold, italics, lists).

      Resume Text:
      ---
      ${resumeText}
      ---`
    });
  }
  
  async sendMessage(message: string): Promise<{ text: string }> {
    this.messages.push({ role: "user", content: message });
    
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: this.messages,
        temperature: 0.7,
        max_tokens: 1000
      });
      
      const responseText = response.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";
      this.messages.push({ role: "assistant", content: responseText });
      
      return { text: responseText };
    } catch (error) {
      console.error("OpenAI chat error:", error);
      throw new Error("Failed to get chat response from OpenAI");
    }
  }
}
