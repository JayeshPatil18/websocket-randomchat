// src/components/Chat.tsx
import React, { useState } from 'react';
import './Chat.css';
import '@fortawesome/fontawesome-free/css/all.min.css';


interface ChatProps {
  isConnected: boolean;
  onSkip: () => void;
  userID: string;
}

const Chat: React.FC<ChatProps> = ({ isConnected, onSkip, userID }) => {
  const [chatMessage, setChatMessage] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<{ sender: string; message: string }[]>([]);

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
    <p style={{ marginLeft: 'auto', fontSize: '12px' }}> {/* Move the online status to the end */}
      <span style={{ fontSize: '12px', marginLeft: '4px' }}>🟢</span> Online
    </p>
  )}
</div>

      <div className="message-box">
        {isConnected ? (
          <>
            <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#979797' }}>
              You're now chatting with a random stranger! Say hi!
            </p>
            {chatHistory.map((msg, index) => (
              <div key={index} className="chat-message">
                <strong>{msg.sender}: </strong>{msg.message}
              </div>
            ))}
          </>
        ) : (
          <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#979797' }}>
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
        />
        <button onClick={handleSendMessage} disabled={!isConnected}>Send</button>
      </div>
    </div>

  );
};

export default Chat;
