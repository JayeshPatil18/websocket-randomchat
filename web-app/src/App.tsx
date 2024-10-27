// src/App.tsx
import React, { useState, useEffect } from 'react';
import Landing from './components/Landing';
import Chat from './components/Chat';
import './App.css';
import socket from './socket'; // Import the socket instance


const App: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [userID] = useState("LG-d4vaVCsAf-xKrAAAB"); // Mock user ID

  const handleJoinChat = (campusCode: string) => {
    console.log("Campus Code:", campusCode); // Optional: Handle campus code if needed

      // Emit the joinCampus event to the Socket.io server
    socket.emit('joinCampus', campusCode);

    // Listen for success or error messages
  socket.once('waiting', (msg) => {
    console.log(msg); // Log the success message
    setIsSearching(true); // Reset searching state
  });

      // Listen for success or error messages
      socket.once('paired', (msg) => {
        console.log(msg); // Log the success message
        setIsConnected(true); // Reset searching state
      });

  socket.once('error', (msg) => {
    alert(msg); // Show an alert with the error message
    setIsSearching(false); // Reset searching state on error
  });
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
