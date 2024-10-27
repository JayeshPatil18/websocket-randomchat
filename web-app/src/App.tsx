// src/App.tsx
import React, { useState } from 'react';
import Landing from './components/Landing';
import Chat from './components/Chat';
import './App.css';

const App: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [userID] = useState("LG-d4vaVCsAf-xKrAAAB"); // Mock user ID

  const handleJoinChat = (campusCode: string) => {
    console.log("Campus Code:", campusCode); // Optional: Handle campus code if needed
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      setIsConnected(true);
    }, 2000); // Mock delay for partner search
  };

  const handleSkip = () => {
    setIsConnected(false);
    setIsSearching(false);
  };

  return (
    <div className="App">
      {!isConnected && !isSearching && (
        <Landing onJoinChat={handleJoinChat} />
      )}
      {(isSearching || isConnected) && (
        <Chat
          isConnected={isConnected}
          onSkip={handleSkip}
          userID={userID}
        />
      )}
    </div>
  );
};

export default App;
