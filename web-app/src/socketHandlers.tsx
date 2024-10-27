// src/socketHandlers.ts
import socket from './socket';
import React from 'react';

const setupSocketListeners = (
  setIsConnected: React.Dispatch<React.SetStateAction<boolean>>,
  setIsSearching: React.Dispatch<React.SetStateAction<boolean>>
) => {
  // Handle the paired event
  socket.on('paired', (msg) => {
    console.log(msg);
    setIsConnected(true);
  });

  // Handle the waiting event
  socket.on('waiting', (msg) => {
    console.log(msg);
    setIsSearching(true);
  });

  // Handle notifications
  socket.on('notification', (msg) => {
    console.log(msg);
  });

  // Handle errors
  socket.on('error', (msg) => {
    alert(msg);
  });

  // Return a cleanup function to remove listeners when necessary
  return () => {
    socket.off('paired');
    socket.off('waiting');
    socket.off('notification');
    socket.off('error');
  };
};

export default setupSocketListeners;
