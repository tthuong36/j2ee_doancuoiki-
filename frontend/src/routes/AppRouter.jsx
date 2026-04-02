// ============================================================
// AppRouter.jsx
// Định nghĩa tất cả routes của ứng dụng.
// Tách riêng để App.jsx không bị lộn xộn.
// ============================================================

import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from '../components/common/ProtectedRoute'
// Thêm import này
import ManageUsersPage from '../pages/admin/ManageUsersPage'

// ── Public pages ─────────────────────────────────────────────
import HomePage         from '../pages/HomePage'
import SearchPage       from '../pages/SearchPage'
import CarDetailPage    from '../pages/CarDetailPage'
import BulletinBoardPage from '../pages/BulletinBoardPage'
import LoginPage        from '../pages/LoginPage'
import RegisterPage     from '../pages/RegisterPage'

// ── Renter pages (role: user) ─────────────────────────────────
import RenterDashboard  from '../pages/renter/RenterDashboard'
import MyBookingsPage   from '../pages/renter/MyBookingsPage'

// ── Owner pages (role: owner) ─────────────────────────────────
import OwnerDashboard   from '../pages/owner/OwnerDashboard'
import MyCarsPage       from '../pages/owner/MyCarsPage'
import AddCarPage       from '../pages/owner/AddCarPage'
import EditCarPage      from '../pages/owner/EditCarPage'

// ── Admin pages (role: admin) ─────────────────────────────────
import AdminDashboard   from '../pages/admin/AdminDashboard'
import ManageCarsPage   from '../pages/admin/ManageCarsPage'
import PendingPostsPage from '../pages/admin/PendingPostsPage'
import PendingBookingsPage from '../pages/admin/PendingBookingsPage'

// ── Shared ────────────────────────────────────────────────────
import ProfilePage from '../pages/shared/ProfilePage'

export default function AppRouter() {
  return (
    <Routes>
      {/* ── Public ── */}
      <Route path="/"         element={<HomePage />} />
      <Route path="/search"   element={<SearchPage />} />
      <Route path="/cars/:id" element={<CarDetailPage />} />
      <Route path="/board"    element={<BulletinBoardPage />} />
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* ── User (người thuê xe) ── */}
      <Route element={<ProtectedRoute allowedRoles={['user', 'owner', 'admin']} />}>
        <Route path="/dashboard"          element={<RenterDashboard />} />
        <Route path="/dashboard/bookings" element={<MyBookingsPage />} />
        <Route path="/dashboard/profile"  element={<ProfilePage />} />
      </Route>

      {/* ── Owner (chủ xe) ── */}
      <Route element={<ProtectedRoute allowedRoles={['owner', 'admin']} />}>
        <Route path="/owner"              element={<OwnerDashboard />} />
        <Route path="/owner/cars"         element={<MyCarsPage />} />
        <Route path="/owner/cars/add"     element={<AddCarPage />} />
        <Route path="/owner/cars/:id/edit" element={<EditCarPage />} />
        <Route path="/owner/profile"      element={<ProfilePage />} />
      </Route>

      {/* ── Admin ── */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="/admin"              element={<AdminDashboard />} />
        <Route path="/admin/cars"         element={<ManageCarsPage />} />
        <Route path="/admin/bookings"     element={<PendingBookingsPage />} />
        <Route path="/admin/posts"        element={<PendingPostsPage />} />
        <Route path="/admin/profile"      element={<ProfilePage />} />
        <Route path="/admin/users" element={<ManageUsersPage />} />
      </Route>

      {/* Redirect 404 về trang chủ */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
