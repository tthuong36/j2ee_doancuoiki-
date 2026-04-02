// ============================================================
// bookingsApi.js
// Tất cả API liên quan đến đặt xe.
// ============================================================

import axiosClient from './axiosClient'

export const ADMIN_BOOKING_STATUS_SUPPORTED = false

/**
 * Tạo đơn đặt xe mới (protected).
 * @param {{ carId, startDate, endDate }} data
 * @returns booking object (có totalPrice)
 */
export function createBooking(data) {
  return axiosClient.post('/bookings', data)
}

/**
 * Lấy danh sách đơn đặt xe của user đang đăng nhập (protected).
 * Trả về danh sách có populate thông tin xe.
 */
export function getMyBookings() {
  return axiosClient.get('/bookings')
}

/** Admin: lấy toàn bộ đơn đặt xe */
export function getAllBookingsForAdmin() {
  // Backend Spring hiện tại chưa có endpoint admin/all, tạm dùng danh sách bookings hiện có.
  return axiosClient.get('/bookings')
}

/** Admin: cập nhật trạng thái đơn đặt xe */
export function updateBookingStatus(id, status) {
  return Promise.reject(new Error('Backend Spring hien tai chua ho tro API cap nhat trang thai booking cho admin'))
}
