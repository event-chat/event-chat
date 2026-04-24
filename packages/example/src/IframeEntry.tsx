import React from 'react'
import ReactDOM from 'react-dom/client'
import './App.css'
import SubChat from './module/rpc/SubChat'
import { iframeName } from './module/rpc/uitls'
import IframeExample from './pages/IframeExample'

const rootEl = document.getElementById('root')
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl)
  root.render(
    <React.StrictMode>
      <IframeExample group={iframeName}>
        <SubChat />
      </IframeExample>
    </React.StrictMode>
  )
}
