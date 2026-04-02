// ============================================================
// carsApi.js
// Tất cả API liên quan đến xe.
// ============================================================

import axiosClient from './axiosClient'

/** Lấy danh sách tất cả xe (public) */
export function getAllCars() {
  return axiosClient.get('/cars')
}

/** Lấy chi tiết 1 xe theo ID */
export function getCarById(id) {
  return axiosClient.get(`/cars/${id}`)
}

/** Lấy danh sách xe của owner đang đăng nhập (protected) */
export function getMyCars() {
  return axiosClient.get('/cars/me/my-cars')
}

/**
 * Thêm xe mới (protected - owner/admin).
 * Dùng FormData vì cần upload ảnh.
 * @param {FormData} formData
 */
export function createCar(formData) {
  return axiosClient.post('/cars', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

/**
 * Cập nhật xe (kèm ảnh mới nếu có).
 * @param {string} id
 * @param {FormData} formData
 */
export function updateCarWithImages(id, formData) {
  return axiosClient.put(`/cars/${id}/with-images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

/**
 * Cập nhật xe (chỉ JSON, không upload ảnh).
 * @param {string} id
 * @param {object} data
 */
export function updateCar(id, data) {
  return axiosClient.put(`/cars/${id}`, data)
}

/** Xóa xe */
export function deleteCar(id) {
  return axiosClient.delete(`/cars/${id}`)
}
