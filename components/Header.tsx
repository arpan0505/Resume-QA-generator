
import React from 'react';

/**
 * Renders the application's header, including the title and branding.
 */
export const Header: React.FC = () => {
  return (
    <header>
      <div className="container mx-auto px-4 py-6 text-center">
        <h1 className="text-3xl md:text-4xl text-slate-200" style={{ fontFamily: 'var(--font-serif)', textShadow: '1px 1px 3px rgba(0,0,0,0.4)' }}>
          The Recruiter's Desk
        </h1>
      </div>
    </header>
  );
};