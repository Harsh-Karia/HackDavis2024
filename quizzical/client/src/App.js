import logo from './logo.svg';
import './App.css';
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import {Home} from './pages/Home.js'
import {Auth} from './pages/Auth.js'
import {Review} from './pages/Review.js'
import { Navbar } from './components/Navbar.js';

function App() {
  return (
    <div className="App">
      <Router>
        <Navbar/>
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/auth" element={<Auth/>}/>
          <Route path="/review" element={<Review/>}/>

        </Routes>
      </Router>
      
    </div>
  );
}

export default App;
