import axiosClient from './axiosClient';

/**
 * Lấy danh sách đánh giá của một xe cụ thể
 * @param {string} carId - ID của xe
 */
export const getCarReviews = (carId) => {
  return axiosClient.get(`/reviews/car/${carId}`);
};

/**
 * Tạo đánh giá mới cho xe
 * @param {string} carId - ID của xe
 * @param {object} data - { rating, comment }
 */
export const createReview = (carId, data) => {
  return axiosClient.post(`/reviews/car/${carId}`, data);
};

/**
 * Cập nhật đánh giá đã viết
 * @param {string} reviewId - ID của bản ghi đánh giá
 * @param {object} data - { rating, comment }
 */
export const updateReview = (reviewId, data) => {
  // Đường dẫn này khớp với router.put('/:id') trong backend reviews.js
  return axiosClient.put(`/reviews/${reviewId}`, data);
};

/**
 * Xóa đánh giá
 * @param {string} reviewId - ID của bản ghi đánh giá
 */
export const deleteReview = (reviewId) => {
  // Đường dẫn này khớp với router.delete('/:id') trong backend reviews.js
  return axiosClient.delete(`/reviews/${reviewId}`);
};