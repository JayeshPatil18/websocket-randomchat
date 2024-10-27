// src/components/Chat.tsx
import React, { useState } from 'react';
import './Chat.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import socket from '../socket';

interface ChatProps {
  isConnected: boolean;
  onSkip: () => void;
}

const Chat: React.FC<ChatProps> = ({ isConnected, onSkip }) => {
  const [chatMessage, setChatMessage] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<{ sender: string; message: string }[]>([]);
  const [userID, setUserId] = useState('');

  socket.once('paired', (data: { message: any; partnerId: any; }) => {
    const { message, partnerId } = data;
  
    setUserId(partnerId);
  });

  const handleSendMessage = () => {
    if (chatMessage) {
      setChatHistory([...chatHistory, { sender: 'You', message: chatMessage }]);
      setChatMessage('');
    }
  };

  return (
    <div className="chat">
      <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexGrow: 1 }}>
          {isConnected ? (
            <p style={{ display: 'flex', alignItems: 'center', margin: 0 }}>
              <i className="fas fa-user-circle" style={{ marginRight: '8px', color: '#6c63ff' }}></i>
              ID: {userID}
            </p>
          ) : (
            <p style={{ margin: 0 }}>🔍 Waiting for partner...</p>
          )}
        </div>
        {isConnected && (
          <p style={{ marginLeft: 'auto', fontSize: '16px' }}> {/* Move the online status to the end */}
            <span style={{ fontSize: '12px', marginLeft: '4px' }}>🟢</span> Online
          </p>
        )}
      </div>

      <div className="message-box">
        {isConnected ? (
          <>
            <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#979797'}}>
              You're now chatting with a random stranger.
            </p>
            {chatHistory.length === 0 && <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#979797'}}>
              <br/>
              Say Hi !!!
            </p>}
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
        <button onClick={onSkip} className="skip-btn">Skip</button>
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
        <button onClick={handleSendMessage} disabled={!isConnected}>Send</button>
      </div>
    </div>

  );
};

export default Chat;
