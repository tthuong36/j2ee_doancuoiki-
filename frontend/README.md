# D2-Car Frontend

Website thuê xe tự lái — React + Vite + Tailwind CSS.

---

## 🚀 Cài đặt & chạy

### 1. Cài dependencies

```bash
cd d2car-frontend
npm install
```

### 2. Cấu hình môi trường

```bash
cp .env.example .env
```

Mở file `.env` và điền URL backend:

```
VITE_API_BASE_URL=http://localhost:5000/api
```

> Có thể đặt `VITE_API_BASE_URL=http://localhost:5000` hoặc `.../api`, frontend sẽ tự chuẩn hóa về `.../api`.

### 3. Chạy development

```bash
npm run dev
```

Mở trình duyệt tại: **http://localhost:3001**

### 4. Build production

```bash
npm run build
```

File tĩnh sẽ được tạo trong thư mục `dist/`.

---

## 📁 Cấu trúc thư mục

```
src/
├── api/                  # Hàm gọi API (Axios)
│   ├── axiosClient.js    # Axios instance + interceptors
│   ├── authApi.js        # Login, Register
│   ├── carsApi.js        # CRUD xe
│   ├── bookingsApi.js    # Đặt xe
│   └── postsApi.js       # Bảng tin
│
├── context/
│   └── AuthContext.jsx   # Quản lý trạng thái đăng nhập (global)
│
├── routes/
│   └── AppRouter.jsx     # Tất cả routes của app
│
├── components/
│   ├── layout/
│   │   ├── Navbar.jsx          # Thanh điều hướng
│   │   ├── Footer.jsx          # Footer trang công khai
│   │   └── DashboardLayout.jsx # Layout sidebar dùng chung
│   └── common/
│       ├── CarCard.jsx         # Card hiển thị xe
│       ├── LoadingSpinner.jsx  # Loading indicator
│       ├── EmptyState.jsx      # Hiển thị khi không có dữ liệu
│       ├── StatusBadge.jsx     # Badge trạng thái
│       └── ProtectedRoute.jsx  # Route bảo vệ theo role
│
├── pages/
│   ├── HomePage.jsx        # Trang chủ
│   ├── SearchPage.jsx      # Tìm kiếm xe
│   ├── CarDetailPage.jsx   # Chi tiết xe + đặt xe
│   ├── BulletinBoardPage.jsx # Bảng tin
│   ├── LoginPage.jsx       # Đăng nhập
│   ├── RegisterPage.jsx    # Đăng ký
│   ├── renter/             # Dashboard người thuê
│   │   ├── RenterDashboard.jsx
│   │   └── MyBookingsPage.jsx
│   ├── owner/              # Dashboard chủ xe
│   │   ├── OwnerDashboard.jsx
│   │   ├── MyCarsPage.jsx
│   │   ├── AddCarPage.jsx
│   │   └── EditCarPage.jsx
│   ├── admin/              # Dashboard admin
│   │   ├── AdminDashboard.jsx
│   │   ├── ManageCarsPage.jsx
│   │   └── PendingPostsPage.jsx
│   └── shared/
│       └── ProfilePage.jsx  # Hồ sơ dùng chung
│
└── utils/
    ├── constants.js        # Hằng số (roles, cities, brands...)
    └── formatters.js       # Hàm format (tiền tệ, ngày tháng...)
```

---

## 🔐 3 Role & URL Dashboard

| Role    | Đăng nhập redirect | Dashboard URL  |
|---------|-------------------|----------------|
| `user`  | `/dashboard`      | `/dashboard`   |
| `owner` | `/owner`          | `/owner`       |
| `admin` | `/admin`          | `/admin`       |

---

## 🔗 Kết nối Backend

Tất cả API calls đều đi qua `src/api/axiosClient.js`.

- **Base URL**: lấy từ `VITE_API_BASE_URL` trong file `.env`
- **Token**: tự động đính kèm `Authorization: Bearer <token>` cho mọi request
- **Lỗi 401**: tự động redirect về `/login`

Khi backend thêm API mới, chỉ cần thêm hàm vào file tương ứng trong `src/api/`.

---

## 🛠 Tech Stack

- **React 18** — UI library
- **Vite** — Build tool (nhanh hơn CRA)
- **React Router v6** — Điều hướng
- **Axios** — HTTP client
- **Tailwind CSS v3** — Styling
- **react-hot-toast** — Thông báo toast
