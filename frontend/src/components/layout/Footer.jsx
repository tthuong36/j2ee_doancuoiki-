// ============================================================
// Footer.jsx
// Footer đơn giản, dùng ở cuối các public page.
// ============================================================

import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-dark-2 border-t border-white/8 mt-20">
      <div className="max-w-7xl mx-auto px-5 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">

        {/* Brand */}
        <div className="md:col-span-2">
          <span className="font-display text-2xl tracking-widest text-white">
            D2<span className="text-primary">-</span>CAR
          </span>
          <p className="mt-3 text-gray-400 text-sm leading-relaxed max-w-xs">
            Nền tảng thuê xe tự lái uy tín — kết nối chủ xe và người thuê trên toàn quốc.
            Thủ tục đơn giản, giá minh bạch, bảo hiểm đầy đủ.
          </p>
        </div>

        {/* Dịch vụ */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
            Dịch Vụ
          </h4>
          <ul className="space-y-2">
            {[
              { to: '/search', label: 'Tìm Xe Thuê' },
              { to: '/board',  label: 'Bảng Tin' },
              { to: '/register?role=owner', label: 'Đăng Xe Cho Thuê' },
            ].map(({ to, label }) => (
              <li key={to}>
                <Link to={to} className="text-sm text-gray-400 hover:text-primary transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Hỗ trợ */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
            Hỗ Trợ
          </h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>📞 Hotline: <span className="text-white">1900 xxxx</span></li>
            <li>✉️ Email: support@d2car.vn</li>
            <li className="pt-1">Thứ 2 – Chủ nhật: 8:00 – 22:00</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/8 py-5">
        <p className="text-center text-gray-500 text-xs">
          © {new Date().getFullYear()} D2-Car. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
