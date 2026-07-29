import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/charts.css'
import App from './App.jsx'
import { LanguageProvider } from './context/LanguageContext.jsx'
import downloadIcon from './assets/download.png'

document.title = 'smart it'
const existingIcon = document.querySelector('link[rel="icon"]')
if (existingIcon) {
  existingIcon.href = downloadIcon
} else {
  const link = document.createElement('link')
  link.rel = 'icon'
  link.type = 'image/png'
  link.href = downloadIcon
  document.head.appendChild(link)
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </StrictMode>,
)
