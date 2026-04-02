// ============================================================
// constants.js
// Tập trung tất cả hằng số dùng chung trong ứng dụng.
// Khi cần thay đổi, chỉ sửa ở đây một lần.
// ============================================================

const normalizeApiBaseUrl = (url) => {
  const cleanUrl = (url || '').trim().replace(/\/+$/, '')
  if (!cleanUrl) return 'http://localhost:5000/api'
  return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`
}

export const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL)

// Key lưu token trong localStorage
export const TOKEN_KEY = 'd2car_token'
export const USER_KEY  = 'd2car_user'

// Role người dùng
export const ROLES = {
  USER:  'user',
  OWNER: 'owner',
  ADMIN: 'admin',
}

// Nhãn hiển thị trạng thái đặt xe
export const BOOKING_STATUS_LABEL = {
  pending:   'Chờ Xác Nhận',
  confirmed: 'Đã Xác Nhận',
  active:    'Đang Thuê',
  completed: 'Hoàn Thành',
  cancelled: 'Đã Hủy',
}

// Nhãn loại bài đăng bảng tin
export const POST_TYPE_LABEL = {
  rent_request: 'Cần Thuê Xe',
  car_offer:    'Cho Thuê Xe',
}

// Danh sách thành phố
export const CITIES = [
  'Hồ Chí Minh',
  'Hà Nội',
  'Đà Nẵng',
  'Đà Lạt',
  'Cần Thơ',
  'Bình Dương',
  'Đồng Nai',
  'Khánh Hòa',
]

// Danh sách hãng xe
export const CAR_BRANDS = [
  'Toyota', 'Kia', 'Mitsubishi', 'Ford',
  'Mazda', 'Honda', 'Hyundai', 'Vinfast',
  'Mercedes', 'Suzuki', 'Isuzu', 'BYD',
]
