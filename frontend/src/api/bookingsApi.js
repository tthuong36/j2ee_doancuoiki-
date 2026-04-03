// ============================================================
// bookingsApi.js
// Tất cả API liên quan đến đặt xe.
// ============================================================

import axiosClient from './axiosClient'

export const ADMIN_BOOKING_STATUS_SUPPORTED = true
export const OWNER_BOOKING_STATUS_SUPPORTED = true

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
  return Promise.resolve({ data: [] })
}

/** Admin: cập nhật trạng thái đơn đặt xe */
export function updateBookingStatus(id, status) {
  return Promise.reject(new Error('Booking approval has moved to owner dashboard'))
}

/** Owner: lấy toàn bộ đơn đặt vào xe của mình */
export function getAllBookingsForOwner() {
  return axiosClient.get('/bookings/owner/all')
}

/** Owner: cập nhật trạng thái đơn đặt xe của mình */
export function updateBookingStatusByOwner(id, status) {
  return axiosClient.patch(`/bookings/owner/${id}/status`, { status })
}
