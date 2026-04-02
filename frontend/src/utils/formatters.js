// ============================================================
// formatters.js
// Các hàm tiện ích để định dạng dữ liệu hiển thị.
// ============================================================

/**
 * Định dạng số tiền sang VNĐ.
 * Ví dụ: 800000 → "800.000 ₫"
 */
export function formatCurrency(amount) {
  if (amount == null) return '—'
  return new Intl.NumberFormat('vi-VN', {
    style:    'currency',
    currency: 'VND',
  }).format(amount)
}

/**
 * Định dạng ngày theo kiểu Việt Nam.
 * Ví dụ: "2024-06-15" → "15/06/2024"
 */
export function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('vi-VN')
}

/**
 * Tính số ngày giữa 2 ngày.
 * Dùng khi tính tổng tiền thuê xe.
 */
export function calcDays(startDate, endDate) {
  const start = new Date(startDate)
  const end   = new Date(endDate)
  const diff  = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
  return diff > 0 ? diff : 0
}

/**
 * Lấy chữ cái đầu từ tên để làm avatar.
 * Ví dụ: "Nguyễn Văn A" → "NV"
 */
export function getInitials(name = '') {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

/**
 * Rút gọn văn bản dài.
 * Ví dụ: truncate("Hello World", 8) → "Hello Wo..."
 */
export function truncate(text = '', maxLength = 100) {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}
