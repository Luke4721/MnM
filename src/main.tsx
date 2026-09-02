import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { CurrencyProvider } from './context/CurrencyProvider.tsx'
import { PackagesProvider } from './context/PackagesProvider.tsx'

// TEMPORARY: Clear cookies and language preference on load for testing
localStorage.removeItem('languagePreference');
document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=' + window.location.hostname;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <CurrencyProvider>
        <PackagesProvider>
          <App />
        </PackagesProvider>
      </CurrencyProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
