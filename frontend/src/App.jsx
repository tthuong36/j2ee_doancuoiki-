// ============================================================
// App.jsx
// Component gốc của ứng dụng.
// Bọc toàn bộ app bằng AuthProvider và BrowserRouter.
// ============================================================

import { BrowserRouter } from 'react-router-dom'
import { Toaster }       from 'react-hot-toast'
import { AuthProvider }  from './context/AuthContext'
import AppRouter         from './routes/AppRouter'

export default function App() {
  return (
    // BrowserRouter: quản lý điều hướng URL
    <BrowserRouter>
      {/* AuthProvider: cung cấp thông tin đăng nhập cho toàn app */}
      <AuthProvider>
        {/* AppRouter: định nghĩa tất cả routes */}
        <AppRouter />

        {/* Toaster: hiển thị thông báo toast (success/error) */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1C1F27',
              color:      '#f0f0f0',
              border:     '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              fontSize:   '14px',
            },
            success: {
              iconTheme: { primary: '#21d07a', secondary: '#1C1F27' },
            },
            error: {
              iconTheme: { primary: '#E8390E', secondary: '#1C1F27' },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  )
}
