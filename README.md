<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Resume Q&A Generator

An AI-powered application that generates personalized interview questions based on your resume. The app analyzes your resume content and creates tailored questions to help you prepare for technical interviews.

## Features

- **Resume Analysis**: Upload PDF, DOCX, or TXT files
- **AI-Generated Questions**: Creates 25-30 questions across Easy, Medium, and Hard difficulty levels
- **Interactive Chat**: Discuss questions and get coaching advice
- **Question Filtering**: Filter by difficulty level
- **Responsive Design**: Works on desktop and mobile devices

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   Create a `.env.local` file and set your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. Run the app:
   ```bash
   npm run dev
   ```

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **AI Service**: OpenAI GPT-4
- **Build Tool**: Vite
- **PDF Processing**: PDF.js
- **Document Processing**: Mammoth.js (for DOCX files)

## Deployment

The app is configured for deployment on Google Cloud Console. Make sure to set the `OPENAI_API_KEY` environment variable in your deployment platform.
