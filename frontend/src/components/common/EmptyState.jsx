// ============================================================
// EmptyState.jsx
// Hiển thị khi danh sách rỗng (không có dữ liệu).
// ============================================================

/**
 * @param {string} icon    - Emoji icon
 * @param {string} title   - Tiêu đề
 * @param {string} message - Mô tả thêm
 * @param {ReactNode} action - Nút hành động (tùy chọn)
 */
export default function EmptyState({ icon = '📭', title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
      <span className="text-5xl opacity-30">{icon}</span>
      {title   && <p className="text-white font-semibold text-lg">{title}</p>}
      {message && <p className="text-gray-400 text-sm max-w-xs">{message}</p>}
      {action  && <div className="mt-2">{action}</div>}
    </div>
  )
}
