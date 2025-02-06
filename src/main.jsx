import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './index.css';
import App from './App';
import Login from './../../Components/Login';
import Dashboard from './../../Components/Dashboard'; 

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <Router>
    <Routes>
      <Route path="/" element={<Login />} />
      {/* Add /dashboard/* to handle nested routes */}
      <Route path="/dashboard/*" element={<Dashboard />} />
    </Routes>
  </Router>
);
