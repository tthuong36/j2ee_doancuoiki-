import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { getCarReviews, createReview, updateReview, deleteReview } from '../../api/reviewsApi'
import { formatDate, getInitials } from '../../utils/formatters'

const getReviewId = (review) => review?.id || review?._id
const getUserId = (userObj) => userObj?.id || userObj?._id || userObj

function StarRating({ value, onChange, readonly = false, size = 24 }) {
  const [hovered, setHovered] = useState(0)
  const display = hovered || value
  return (
    <div style={{ display: 'inline-flex', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star}
          onClick={() => !readonly && onChange && onChange(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          style={{ fontSize: `${size}px`, cursor: readonly ? 'default' : 'pointer', color: star <= display ? '#FBBF24' : '#374151', transition: 'color 0.15s', userSelect: 'none' }}>
          ★
        </span>
      ))}
    </div>
  )
}

function RatingSummary({ reviews }) {
  const total = reviews.length
  if (total === 0) return null
  const avg = (reviews.reduce((s, r) => s + r.rating, 0) / total).toFixed(1)
  const counts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    pct: Math.round((reviews.filter((r) => r.rating === star).length / total) * 100),
  }))
  return (
    <div style={{ display: 'flex', gap: '32px', alignItems: 'center', padding: '20px', background: '#1E2129', borderRadius: '12px', marginBottom: '24px', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div style={{ textAlign: 'center', minWidth: '80px' }}>
        <p style={{ fontSize: '48px', fontWeight: '700', color: '#FBBF24', lineHeight: 1, margin: 0 }}>{avg}</p>
        <StarRating value={Math.round(avg)} readonly size={16} />
        <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>{total} đánh giá</p>
      </div>
      <div style={{ flex: 1 }}>
        {counts.map(({ star, count, pct }) => (
          <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '12px', color: '#9CA3AF', width: '12px', textAlign: 'right' }}>{star}</span>
            <span style={{ fontSize: '14px', color: '#FBBF24' }}>★</span>
            <div style={{ flex: 1, height: '6px', background: '#252931', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', background: '#FBBF24', borderRadius: '999px' }} />
            </div>
            <span style={{ fontSize: '12px', color: '#6B7280', width: '28px' }}>{count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ReviewForm({ carId, onSuccess }) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!comment.trim()) { toast.error('Vui lòng nhập nội dung đánh giá'); return }
    setLoading(true)
    try {
      await createReview(carId, { rating, comment })
      toast.success('Đánh giá đã được gửi! ✅')
      setComment('')
      setRating(5)
      onSuccess()
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Gửi đánh giá thất bại')
    } finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} style={{ background: '#1E2129', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
      <h4 style={{ color: '#fff', fontWeight: '700', marginBottom: '16px', margin: '0 0 16px' }}>✍️ Viết Đánh Giá Của Bạn</h4>
      <div style={{ marginBottom: '12px' }}>
        <p style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Số Sao</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <StarRating value={rating} onChange={setRating} size={32} />
          <span style={{ fontSize: '14px', color: '#FBBF24', fontWeight: '600' }}>
            {['', 'Rất Tệ', 'Tệ', 'Bình Thường', 'Tốt', 'Xuất Sắc'][rating]}
          </span>
        </div>
      </div>
      <div style={{ marginBottom: '16px' }}>
        <p style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Nội Dung</p>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Chia sẻ trải nghiệm của bạn về xe này..."
          rows={3}
          style={{ width: '100%', background: '#252931', border: '1px solid rgba(255,255,255,0.1)', color: '#F3F4F6', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
          onFocus={(e) => e.target.style.borderColor = '#E8390E'}
          onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
        />
        <p style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px', textAlign: 'right' }}>{comment.length}/500</p>
      </div>
      <button type="submit" disabled={loading}
        style={{ padding: '10px 24px', background: '#E8390E', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
        {loading ? '⏳ Đang gửi...' : '📤 Gửi Đánh Giá'}
      </button>
    </form>
  )
}

function ReviewCard({ review, currentUserId, isAdmin, onDeleted, onUpdated }) {
  const [editing, setEditing] = useState(false)
  const [editRating, setEditRating] = useState(review.rating)
  const [editComment, setEditComment] = useState(review.comment)
  const [saving, setSaving] = useState(false)
  const reviewId = getReviewId(review)
  const reviewUserId = getUserId(review.user)
  const isOwner = reviewUserId === currentUserId
  const canEdit = isOwner || isAdmin

  async function handleUpdate(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const { data } = await updateReview(reviewId, { rating: editRating, comment: editComment })
      toast.success('Đã cập nhật đánh giá!')
      setEditing(false)
      onUpdated(data)
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Cập nhật thất bại')
    } finally { setSaving(false) }
  }

  async function handleDelete() {
    if (!window.confirm('Xóa đánh giá này?')) return
    try {
      await deleteReview(reviewId)
      toast.success('Đã xóa')
      onDeleted(reviewId)
    } catch { toast.error('Xóa thất bại') }
  }

  return (
    <div style={{ background: '#1E2129', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px', marginBottom: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#E8390E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', color: '#fff', flexShrink: 0 }}>
            {getInitials(review.user?.name || 'U')}
          </div>
          <div>
            <p style={{ fontWeight: '600', color: '#fff', fontSize: '14px', margin: 0 }}>{review.user?.name || 'Người dùng'}</p>
            <p style={{ fontSize: '11px', color: '#6B7280', margin: 0 }}>{formatDate(review.createdAt)}</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <StarRating value={review.rating} readonly size={16} />
          {canEdit && !editing && (
            <div style={{ display: 'flex', gap: '4px' }}>
              {isOwner && (
                <button onClick={() => setEditing(true)}
                  style={{ padding: '3px 8px', background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: '#9CA3AF', borderRadius: '6px', cursor: 'pointer', fontSize: '11px' }}>
                  ✏️ Sửa
                </button>
              )}
              <button onClick={handleDelete}
                style={{ padding: '3px 8px', background: 'transparent', border: '1px solid rgba(248,113,113,0.3)', color: '#F87171', borderRadius: '6px', cursor: 'pointer', fontSize: '11px' }}>
                🗑️
              </button>
            </div>
          )}
        </div>
      </div>
      {editing ? (
        <form onSubmit={handleUpdate}>
          <div style={{ marginBottom: '8px' }}><StarRating value={editRating} onChange={setEditRating} size={24} /></div>
          <textarea value={editComment} onChange={(e) => setEditComment(e.target.value)} rows={2}
            style={{ width: '100%', background: '#252931', border: '1px solid #E8390E', color: '#F3F4F6', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: '8px' }} />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="submit" disabled={saving}
              style={{ padding: '6px 16px', background: '#E8390E', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', fontSize: '12px', cursor: 'pointer' }}>
              {saving ? 'Đang lưu...' : '💾 Lưu'}
            </button>
            <button type="button" onClick={() => setEditing(false)}
              style={{ padding: '6px 14px', background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: '#9CA3AF', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
              Hủy
            </button>
          </div>
        </form>
      ) : (
        <p style={{ fontSize: '14px', color: '#D1D5DB', lineHeight: '1.6', margin: 0 }}>
          {review.comment || <span style={{ color: '#6B7280', fontStyle: 'italic' }}>Không có nội dung</span>}
        </p>
      )}
    </div>
  )
}

export default function ReviewSection({ carId }) {
  const { isAuthenticated, user } = useAuth()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('newest')

  function loadReviews() {
    setLoading(true)
    getCarReviews(carId)
      .then(({ data }) => setReviews(data || []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadReviews() }, [carId])

  const myReview = reviews.find((r) => getUserId(r.user) === user?.id)
  const sorted = [...reviews].sort((a, b) => {
    if (sortBy === 'newest')  return new Date(b.createdAt) - new Date(a.createdAt)
    if (sortBy === 'oldest')  return new Date(a.createdAt) - new Date(b.createdAt)
    if (sortBy === 'highest') return b.rating - a.rating
    if (sortBy === 'lowest')  return a.rating - b.rating
    return 0
  })

  return (
    <div style={{ marginTop: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: '28px', letterSpacing: '1px', color: '#fff', margin: 0 }}>
          ĐÁNH GIÁ <span style={{ color: '#E8390E' }}>XE</span>
          <span style={{ fontSize: '14px', fontFamily: 'sans-serif', fontWeight: '400', color: '#6B7280', marginLeft: '8px' }}>({reviews.length})</span>
        </h2>
        {reviews.length > 1 && (
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
            style={{ background: '#1E2129', border: '1px solid rgba(255,255,255,0.1)', color: '#D1D5DB', padding: '6px 12px', borderRadius: '8px', fontSize: '13px', outline: 'none', cursor: 'pointer' }}>
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
            <option value="highest">Sao cao nhất</option>
            <option value="lowest">Sao thấp nhất</option>
          </select>
        )}
      </div>

      {reviews.length > 0 && <RatingSummary reviews={reviews} />}

      {isAuthenticated && !myReview && <ReviewForm carId={carId} onSuccess={loadReviews} />}

      {isAuthenticated && myReview && (
        <div style={{ background: 'rgba(232,57,14,0.08)', border: '1px solid rgba(232,57,14,0.2)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', fontSize: '13px', color: '#E8390E' }}>
          ✅ Bạn đã đánh giá xe này. Bạn có thể sửa hoặc xóa bên dưới.
        </div>
      )}

      {!isAuthenticated && (
        <div style={{ background: '#1E2129', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '20px', marginBottom: '20px', textAlign: 'center' }}>
          <p style={{ color: '#9CA3AF', fontSize: '14px', marginBottom: '12px' }}>Đăng nhập để viết đánh giá về xe này</p>
          <a href="/login" style={{ display: 'inline-block', padding: '8px 20px', background: '#E8390E', color: '#fff', borderRadius: '8px', fontWeight: '600', fontSize: '14px', textDecoration: 'none' }}>
            Đăng Nhập
          </a>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>Đang tải đánh giá...</div>
      ) : sorted.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 20px', background: '#1E2129', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }}>
          <p style={{ fontSize: '36px', opacity: 0.2, marginBottom: '8px' }}>⭐</p>
          <p style={{ color: '#6B7280', fontSize: '14px' }}>Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
        </div>
      ) : (
        <div>
          {sorted.map((review) => (
            <ReviewCard key={getReviewId(review)} review={review}
              currentUserId={user?.id}
              isAdmin={user?.role === 'admin'}
              onDeleted={(id) => setReviews((p) => p.filter((r) => getReviewId(r) !== id))}
              onUpdated={(updated) => setReviews((p) => p.map((r) => getReviewId(r) === getReviewId(updated) ? updated : r))}
            />
          ))}
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}