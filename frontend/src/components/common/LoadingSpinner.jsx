// ============================================================
// LoadingSpinner.jsx
// Component loading spinner tái sử dụng.
// ============================================================

/**
 * @param {string} text - Text hiển thị bên dưới spinner (tùy chọn)
 */
export default function LoadingSpinner({ text = 'Đang tải...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-10 h-10 border-4 border-white/10 border-t-primary rounded-full animate-spin" />
      {text && <p className="text-gray-400 text-sm">{text}</p>}
    </div>
  )
}
