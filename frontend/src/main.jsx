import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import './index.css';

// FIX: Agar Vite Proxy (vite.config.js) use kar rahe hain, 
// toh baseURL ko '/api' set karein ya khali chhodein.
// Isse double '/api/api' wala error khatam ho jayega.
axios.defaults.baseURL = 'http://localhost:5000/api'; // Agar proxy use nahi karni
axios.defaults.baseURL = '/api'; // Agar Vite proxy use karni hai

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);