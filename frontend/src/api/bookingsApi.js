// ============================================================
// bookingsApi.js
// Tất cả API liên quan đến đặt xe.
// ============================================================

import axiosClient from './axiosClient'

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
  return axiosClient.get('/bookings/admin/all')
}

/** Admin: cập nhật trạng thái đơn đặt xe */
export function updateBookingStatus(id, status) {
  return axiosClient.patch(`/bookings/admin/${id}/status`, { status })
}
