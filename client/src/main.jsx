import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { GoogleOAuthProvider } from '@react-oauth/google'

// We grab the key you just saved in your .env file
const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

ReactDOM.createRoot(document.getElementById('root')).render(
  
    <GoogleOAuthProvider clientId="824346020703-0h7ghlf7s8q8f9rpal80q14fe46fotmb.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>

)
button >
  onError;
