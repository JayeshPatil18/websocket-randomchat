// src/socket.ts
import { io } from 'socket.io-client';

// Create and export the socket connection
const socket = io('http://localhost:3000');

export default socket;
