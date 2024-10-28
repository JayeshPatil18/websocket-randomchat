// src/components/Landing.tsx
import React, { useState } from 'react';
import './Landing.css';

interface LandingProps {
  onJoinChat: (campusCode: string) => void;
}

const Landing: React.FC<LandingProps> = ({ onJoinChat }) => {
  const [campusCode, setCampusCode] = useState('');

  const handleJoinClick = () => {
    onJoinChat(campusCode);
  };

  return (
    <div className="landing">
      <h1>Raisoni Katta</h1>
      <p>Find your perfect partner ❤️</p>
      <input
        type="text"
        placeholder="Enter Campus Code"
        value={campusCode}
        onChange={(e) => setCampusCode(e.target.value)}
        className="campus-code-input"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleJoinClick();
          }
        }}
      />
      <button onClick={handleJoinClick} className="join-chat-btn">
        Join Chat
      </button>
    </div>
  );
};

export default Landing;
