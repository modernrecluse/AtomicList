import React from 'react'
import ReactDOM from 'react-dom/client'
import AtomicListApp from './AtomicList.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AtomicListApp />
  </React.StrictMode>,
)