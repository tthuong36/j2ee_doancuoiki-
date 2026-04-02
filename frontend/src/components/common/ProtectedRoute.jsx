// ============================================================
// ProtectedRoute.jsx
// Bảo vệ các route yêu cầu đăng nhập hoặc role cụ thể.
//
// Cách dùng trong AppRouter:
//   <Route element={<ProtectedRoute allowedRoles={['owner']} />}>
//     <Route path="/owner" element={<OwnerDashboard />} />
//   </Route>
// ============================================================

import { Navigate, Outlet } from 'react-router-dom'
import { useAuth }          from '../../context/AuthContext'

/**
 * @param {string[]} allowedRoles - Danh sách role được phép vào route này
 */
export default function ProtectedRoute({ allowedRoles = [] }) {
  const { isAuthenticated, user } = useAuth()

  // Chưa đăng nhập → về trang login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Đã đăng nhập nhưng role không được phép → về trang chủ
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />
  }

  // Hợp lệ → render route con
  return <Outlet />
}
