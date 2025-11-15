import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './suppressWarnings.js'
import './index.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'react-quill/dist/quill.snow.css'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
)