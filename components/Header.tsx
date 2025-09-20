
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="py-8 text-center bg-transparent">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-100">
          <span className="bg-gradient-to-r from-fuchsia-500 to-cyan-400 text-transparent bg-clip-text">
            Forza Color Universe
          </span>
        </h1>
        <p className="mt-4 text-lg text-slate-300 max-w-2xl mx-auto">
          Explore the official manufacturer colors found in the world of Forza.
        </p>
    </header>
  );
};

export default Header;
