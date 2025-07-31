import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './components/styles.css'

// Point react‑modal at your root DOM node
//Modal.setAppElement('#root')

createRoot(document.getElementById('root')!).render(<App />)