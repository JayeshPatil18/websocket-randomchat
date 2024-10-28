// src/App.tsx
import React, { useState } from 'react';
import Landing from './components/Landing';
import Chat from './components/Chat';
import './App.css';

const App: React.FC = () => {
  const [campusCode, setCampusCode] = useState<string | null>(null);

  const handleJoinChat = (code: string) => {
    setCampusCode(code);
  };

  return (
    <div className="App">
      {campusCode ? (
        <Chat campusCode={campusCode} />
      ) : (
        <Landing onJoinChat={handleJoinChat} />
      )}
    </div>
  );
};

export default App;
