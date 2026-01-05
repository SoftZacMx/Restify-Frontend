import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { getInitialTheme, applyTheme } from './shared/utils/theme.utils'

// Aplicar tema antes de que React se monte para evitar flash
const initialTheme = getInitialTheme();
applyTheme(initialTheme);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
