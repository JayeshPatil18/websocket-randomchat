// src/components/Chat.tsx
import React, { useState, useEffect } from 'react';
import './Chat.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import socket from '../socket';

interface ChatProps {
  campusCode: string;
}

const Chat: React.FC<ChatProps> = ({ campusCode }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isSearching, setIsSearching] = useState(true);
  const [chatMessage, setChatMessage] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<{ sender: string; message: string }[]>([]);
  const [userID, setUserId] = useState('');
  const [sysMsg, setSysMsg] = useState("You're now chatting with a random stranger.");

  useEffect(() => {
    // Join the chat room when campus code is provided
    socket.emit('joinCampus', campusCode);

    socket.once('waiting', () => setIsSearching(true));
    socket.once('paired', (data: { message: string; partnerId: string }) => {
      setIsConnected(true);
      setIsSearching(false);
      setUserId(data.partnerId);
      setSysMsg(data.message || "You're now paired with a stranger.");
    });
    socket.once('error', (msg) => {
      alert(msg);
      setIsSearching(false);
    });

    socket.on('notification', (msg) => {
      if (msg !== "A new user has joined campus ghrcem") {
        setSysMsg(msg);
      }
    });

    socket.on('message', (msg) => {
      setChatHistory((prev) => [...prev, { sender: 'Partner', message: msg.message }]);
    });

    socket.on('userDisconnected', () => {
      setChatHistory((prev) => [...prev, { sender: 'System', message: 'Your chat partner has disconnected.' }]);
      handleSkip();
    });

    // Cleanup event listeners when component unmounts
    return () => {
      socket.off('waiting');
      socket.off('paired');
      socket.off('error');
      socket.off('notification');
      socket.off('message');
      socket.off('userDisconnected');
    };
  }, [campusCode]);

  const handleSendMessage = () => {
    if (chatMessage) {
      setChatHistory([...chatHistory, { sender: 'You', message: chatMessage }]);
      socket.emit('message', { message: chatMessage });
      setChatMessage('');
    }
  };

  const handleSkip = () => {
    setIsConnected(false);
    setIsSearching(true);
    // setChatHistory([]);
    setSysMsg("You're now chatting with a random stranger.");
  };

  const handleSystemMessage = () => {
    return chatHistory.length === 0 && (sysMsg === "You're now chatting with a random stranger." || sysMsg === "You are now paired with a random user");
  };

  return (
    <div className="chat">
      <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexGrow: 1 }}>
          {isConnected ? (
            <p style={{ display: 'flex', alignItems: 'center', margin: 0 }}>
              <i className="fas fa-user-circle" style={{ marginRight: '8px', color: '#6c63ff' }}></i>
              {userID ? `ID: ${userID}` : 'Partner'}
            </p>
          ) : isSearching ? (
            <p style={{ margin: 0 }}>🔍 Waiting for partner...</p>
          ) : (
            <p style={{ margin: 0 }}>Disconnected</p>
          )}
        </div>
        {isConnected && (
          <p style={{ marginLeft: 'auto', fontSize: '16px' }}>
            <span style={{ fontSize: '12px', marginLeft: '4px' }}>🟢</span> Online
          </p>
        )}
      </div>

      <div className="message-box">
        {isConnected ? (
          <>
            <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#979797' }}>{sysMsg}</p>
            {handleSystemMessage() && (
              <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#979797' }}>
                <br />
                Say Hi !!!
              </p>
            )}
            {chatHistory.map((msg, index) => (
              <div key={index} className="chat-message">
                <strong>{msg.sender}: </strong>
                <span className="message-text">{msg.message}</span>
              </div>
            ))}
          </>
        ) : (
          <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#979797' }}>
            Sabra ka phal meetha hi hota hai!!!
          </p>
        )}
      </div>

      <div className="input-box">
        <button onClick={handleSkip} className="skip-btn">
          Skip
        </button>
        <input
          type="text"
          placeholder="Type Message"
          value={chatMessage}
          onChange={(e) => setChatMessage(e.target.value)}
          disabled={!isConnected}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && isConnected) {
              handleSendMessage();
            }
          }}
        />
        <button onClick={handleSendMessage} disabled={!isConnected}>
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
