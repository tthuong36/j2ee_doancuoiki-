// ============================================================
// main.jsx
// Điểm khởi đầu của ứng dụng React.
// Mount App vào thẻ <div id="root"> trong index.html.
// ============================================================

import React    from 'react'
import ReactDOM from 'react-dom/client'
import App      from './App'
import './index.css'   // Tailwind CSS

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
