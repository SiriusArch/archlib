import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { temaBaslangicUygula } from './lib/tema'
import './index.css'

// Ilk boyamadan once uygulanir: kullanici koyu tema sectiyse sayfa acik
// temayla acilip aninda koyuya donmesin (FOUC).
temaBaslangicUygula()

const kok = document.getElementById('root')
if (!kok) throw new Error('#root bulunamadi')

createRoot(kok).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
