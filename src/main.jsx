import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import './paywall/paywall.css'
import PaywallPage from './paywall/PaywallPage'

function App() {
  return <PaywallPage />
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
