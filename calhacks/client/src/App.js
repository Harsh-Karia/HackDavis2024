import logo from './logo.svg';
import './App.css';
import axios from 'axios'; 
import React, { useState, useEffect } from 'react';


function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Make a GET request to the backend when the component mounts
    axios.get('http://localhost:3000/') // Replace with your server's URL
      .then((response) => {
        setMessage(response.data);
      })
      .catch((error) => {
        console.error('Error making API request:', error);
      });
  }, []);

  return (
    <div className="App">
      <p>Response from the server:</p>
      <p>{message}</p>
    </div>
  );
}

export default App;
