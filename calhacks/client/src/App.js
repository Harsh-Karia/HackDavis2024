import './App.css';
import axios from 'axios'; 
import React, { useState, useEffect } from 'react';
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import {FileUploader} from './components/FileUploader';

function App() {

  return (
    <div className="App">
      <FileUploader/>
    </div>
  );
}

export default App;
