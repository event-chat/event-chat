import React from 'react'
import ReactDOM from 'react-dom/client'
import Mount from './Mount'

const rootEl = document.getElementById('root')
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl)
  root.render(
    <React.StrictMode>
      <Mount />
    </React.StrictMode>
  )
}
