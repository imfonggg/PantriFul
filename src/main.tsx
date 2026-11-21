import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Body font option for design review: /?font=montserrat (default is Nexa).
const font = new URLSearchParams(window.location.search).get('font')
document.documentElement.dataset.font = font === 'montserrat' ? 'montserrat' : 'nexa'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
