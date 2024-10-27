const io = require('socket.io-client');

const socket = io('http://localhost:3000'); // Adjust the URL as needed

// Listen for connection
socket.on('connect', () => {
    console.log('Connected to server');

    // Join a campus chat
    socket.emit('join', { campusCode: 'PUNE_UNI_001' });

    // Send a test message
    socket.emit('chatMessage', { message: 'Hello, test!' });
});

// Listen for incoming messages
socket.on('chatMessage', (data) => {
    console.log('New message:', data);
});

// Handle disconnection
socket.on('disconnect', () => {
    console.log('Disconnected from server');
});
