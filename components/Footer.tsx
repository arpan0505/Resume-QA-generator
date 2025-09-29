
import React from 'react';

/**
 * Renders the application's footer with copyright information.
 */
export const Footer: React.FC = () => {
  return (
    <footer>
      <div className="container mx-auto px-4 py-4 text-center text-slate-500 text-xs">
        <p>&copy; {new Date().getFullYear()} Resume Q&A Generator. Created by Arpan Neog.</p>
      </div>
    </footer>
  );
};