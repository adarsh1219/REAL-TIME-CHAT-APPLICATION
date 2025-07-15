const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

const chatHistoryPath = path.join(__dirname, 'data', 'chat_history.json');

// Load existing chat history
let chatHistory = [];
try {
  const data = fs.readFileSync(chatHistoryPath, 'utf8');
  chatHistory = JSON.parse(data).messages;
} catch (error) {
  console.log('No existing chat history found');
}

const wss = new WebSocket.Server({ port: 3001 });

console.log('WebSocket server is running on ws://localhost:3001');

wss.on('connection', function connection(ws) {
  console.log('New client connected');

  // Send existing chat history to new client
  chatHistory.forEach(message => {
    ws.send(JSON.stringify(message));
  });

  ws.on('message', function incoming(message) {
    console.log('Received message:', message);
    
    const newMessage = JSON.parse(message);
    chatHistory.push(newMessage);

    // Save to file
    fs.writeFileSync(chatHistoryPath, JSON.stringify({ messages: chatHistory }, null, 2));
    
    // Broadcast to all connected clients
    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on('close', function close() {
    console.log('Client disconnected');
  });
});
