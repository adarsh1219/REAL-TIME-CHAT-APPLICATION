import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import { IconButton, TextField, Box, Typography, Paper } from '@mui/material';
import { Send, EmojiEmotions, AttachFile, Mic } from '@mui/icons-material';
import ReactAvatar from 'react-avatar';
import { formatDistanceToNow } from 'date-fns';
import axios from 'axios';

const ChatContainer = styled(Box)`
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 100%);
  background-size: 400% 400%;
  animation: gradientBG 15s ease infinite;

  @keyframes gradientBG {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
`;

const ChatArea = styled(Box)`
  flex: 1;
  display: flex;
  overflow: hidden;
`;

const MessagesContainer = styled(Box)`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  margin: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const DynamicImage = styled(Box)`
  width: 300px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  margin: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const Message = styled(Paper)`
  margin: 10px 0;
  padding: 15px;
  border-radius: 20px;
  max-width: 70%;
  background: ${props => props.isMe ? '#0084ff' : '#f5f5f5'};
  color: black;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const MessageInfo = styled(Box)`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
`;

const InputContainer = styled(Box)`
  padding: 20px;
  background: rgba(255, 255, 255, 0.95);
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
`;

const InputBox = styled(Box)`
  display: flex;
  gap: 10px;
  background: rgba(255, 255, 255, 0.9);
  padding: 10px;
  border-radius: 30px;
  flex: 1;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const [dynamicImage, setDynamicImage] = useState(null);
  const [user, setUser] = useState({
    name: 'User',
    color: '#' + Math.floor(Math.random()*16777215).toString(16)
  });

  useEffect(() => {
    socketRef.current = new WebSocket('ws://localhost:3001');

    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages(prev => [...prev, { ...data, timestamp: new Date().toISOString() }]);
    };

    socketRef.current.onopen = () => {
      console.log('Connected to WebSocket server');
    };

    socketRef.current.onclose = () => {
      console.log('Disconnected from WebSocket server');
    };

    const fetchNewImage = async () => {
      try {
        const response = await axios.get('https://api.unsplash.com/photos/random', {
          headers: {
            Authorization: 'Client-ID YOUR_UNSPLASH_ACCESS_KEY' // Replace with your Unsplash access key
          },
          params: {
            query: 'nature',
            orientation: 'landscape'
          }
        });
        setDynamicImage(response.data.urls.regular);
      } catch (error) {
        console.error('Error fetching image:', error);
      }
    };

    fetchNewImage();
    const interval = setInterval(fetchNewImage, 30000);

    return () => {
      socketRef.current.close();
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const message = {
      id: uuidv4(),
      content: input,
      isMe: true,
      timestamp: new Date().toISOString(),
      user: user
    };

    socketRef.current.send(JSON.stringify(message));
    setInput('');
  };

  return (
    <ChatContainer>
      <ChatArea>
        <MessagesContainer>
          {messages.map((msg) => (
            <Box key={msg.id} sx={{ display: 'flex', justifyContent: msg.isMe ? 'flex-end' : 'flex-start' }}>
              <Message isMe={msg.isMe} elevation={1}>
                <MessageInfo>
                  <ReactAvatar name={msg.user?.name || 'User'} size={30} round={true} color={msg.user?.color} />
                  <Typography variant="caption" sx={{ ml: 1 }}>
                    {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}
                  </Typography>
                </MessageInfo>
                <Typography>{msg.content}</Typography>
              </Message>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </MessagesContainer>
        <DynamicImage>
          {dynamicImage && (
            <img 
              src={dynamicImage} 
              alt="Dynamic"
              style={{ 
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '15px'
              }}
            />
          )}
        </DynamicImage>
      </ChatArea>
      <InputContainer>
        <InputBox component="form" onSubmit={sendMessage}>
          <IconButton>
            <EmojiEmotions />
          </IconButton>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            InputProps={{
              disableUnderline: true,
              sx: { p: 0 }
            }}
          />
          <IconButton>
            <AttachFile />
          </IconButton>
          <IconButton type="submit" onClick={sendMessage}>
            <Send />
          </IconButton>
          <IconButton>
            <Mic />
          </IconButton>
        </InputBox>
      </InputContainer>
    </ChatContainer>
  );
};

export default Chat;
