import React from 'react';
import styled from 'styled-components';
import Chat from './components/Chat';

const Container = styled.div`
  display: flex;
  height: 100vh;
  background-color: #f0f2f5;
`;

const App = () => {
  return (
    <Container>
      <Chat />
    </Container>
  );
};

export default App;
