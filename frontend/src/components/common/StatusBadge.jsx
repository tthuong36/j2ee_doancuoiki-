// ============================================================
// StatusBadge.jsx
// Badge màu sắc hiển thị trạng thái đơn đặt xe / bài đăng.
// ============================================================

// Map trạng thái → màu Tailwind + nhãn tiếng Việt
const STATUS_CONFIG = {
  // Booking statuses
  pending:   { label: 'Chờ Xác Nhận', className: 'bg-yellow-500/15 text-yellow-400' },
  confirmed: { label: 'Đã Xác Nhận',  className: 'bg-blue-500/15   text-blue-400'   },
  active:    { label: 'Đang Thuê',    className: 'bg-emerald-500/15 text-emerald-400'},
  completed: { label: 'Hoàn Thành',   className: 'bg-gray-500/15    text-gray-400'  },
  cancelled: { label: 'Đã Hủy',       className: 'bg-red-500/15     text-red-400'   },
  // Post statuses
  approved:  { label: 'Đã Duyệt',     className: 'bg-emerald-500/15 text-emerald-400'},
  rejected:  { label: 'Từ Chối',      className: 'bg-red-500/15     text-red-400'   },
  // Car availability
  available: { label: 'Còn Xe',       className: 'bg-emerald-500/15 text-emerald-400'},
  rented:    { label: 'Đang Cho Thuê',className: 'bg-orange-500/15  text-orange-400'},
}

/**
 * @param {string} status - Trạng thái (pending, confirmed, active, ...)
 */
export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    className: 'bg-gray-500/15 text-gray-400',
  }

  return (
    <span
      className={`inline-block text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide ${config.className}`}
    >
      {config.label}
    </span>
  )
}
