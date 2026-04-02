// ============================================================
// PendingPostsPage.jsx
// Admin duyệt / từ chối bài đăng trên bảng tin.
// ============================================================

import { useState, useEffect } from 'react'
import toast             from 'react-hot-toast'
import DashboardLayout   from '../../components/layout/DashboardLayout'
import LoadingSpinner    from '../../components/common/LoadingSpinner'
import EmptyState        from '../../components/common/EmptyState'
import { getPendingPosts, approvePost, rejectPost } from '../../api/postsApi'
import { formatDate }    from '../../utils/formatters'
import { ADMIN_NAV }     from './AdminDashboard'
import { POST_TYPE_LABEL } from '../../utils/constants'

export default function PendingPostsPage() {
  const [posts, setPosts]     = useState([])
  const [loading, setLoading] = useState(true)
  // Lưu ghi chú nhận xét cho từng bài
  const [notes, setNotes]     = useState({})

  useEffect(() => {
    getPendingPosts()
      .then(({ data }) => setPosts(data))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false))
  }, [])

  async function handleApprove(id) {
    try {
      await approvePost(id, notes[id] ?? '')
      toast.success('Đã duyệt bài đăng ✅')
      setPosts((p) => p.filter((post) => (post.id || post._id) !== id))
    } catch {
      toast.error('Duyệt thất bại')
    }
  }

  async function handleReject(id) {
    if (!notes[id]?.trim()) {
      toast.error('Vui lòng nhập lý do từ chối')
      return
    }
    try {
      await rejectPost(id, notes[id])
      toast.success('Đã từ chối bài đăng')
      setPosts((p) => p.filter((post) => (post.id || post._id) !== id))
    } catch {
      toast.error('Từ chối thất bại')
    }
  }

  return (
    <DashboardLayout navItems={ADMIN_NAV}>

      <div className="mb-8">
        <h1 className="font-display text-3xl tracking-wide">
          DUYỆT BÀI ĐĂNG
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          {posts.length} bài đang chờ duyệt
        </p>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : posts.length === 0 ? (
        <EmptyState
          icon="✅"
          title="Không có bài nào chờ duyệt"
          message="Tất cả bài đăng đã được xử lý"
        />
      ) : (
        <div className="space-y-5">
          {posts.map((post) => {
            const postId = post.id || post._id
            return (
            <div key={postId} className="card p-6">

              {/* Header bài đăng */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  {/* Loại bài */}
                  <span className={`text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                    post.postType === 'rent_request'
                      ? 'bg-blue-500/15 text-blue-400'
                      : 'bg-emerald-500/15 text-emerald-400'
                  }`}>
                    {POST_TYPE_LABEL[post.postType] ?? post.postType}
                  </span>
                  <h3 className="font-bold text-white text-lg mt-2">{post.title}</h3>
                </div>
                <span className="text-xs text-gray-500 shrink-0">
                  {formatDate(post.createdAt)}
                </span>
              </div>

              {/* Nội dung */}
              <p className="text-gray-300 text-sm leading-relaxed mb-3">
                {post.content}
              </p>

              {/* Meta info */}
              <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-5">
                {post.location    && <span>📍 {post.location}</span>}
                {post.budgetPerDay && <span>💰 ~{(post.budgetPerDay/1000).toFixed(0)}K/ngày</span>}
                {post.contactPhone && <span>📞 {post.contactPhone}</span>}
                {post.author?.email && <span>👤 {post.author.email}</span>}
              </div>

              {/* Ô nhập ghi chú */}
              <div className="mb-4">
                <label className="label">Ghi Chú Xét Duyệt (bắt buộc khi từ chối)</label>
                <input
                  type="text"
                  value={notes[postId] ?? ''}
                  onChange={(e) =>
                    setNotes((p) => ({ ...p, [postId]: e.target.value }))
                  }
                  placeholder="VD: Nội dung hợp lệ / Thiếu thông tin liên hệ"
                  className="input"
                />
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleApprove(postId)}
                  className="btn-success btn"
                >
                  ✅ Duyệt Bài
                </button>
                <button
                  onClick={() => handleReject(postId)}
                  className="btn-danger btn"
                >
                  ✕ Từ Chối
                </button>
              </div>
            </div>
            )
          })}
        </div>
      )}
    </DashboardLayout>
  )
}
