# PK Network — Edge Data & Schema Architect

Ứng dụng quản trị Schema và dữ liệu cá nhân (Personal Data Entry CMS) chạy trên nền tảng **Cloudflare Workers (Edge)** kết nối **Turso Cloud SQLite**, được xây dựng bằng **React 19, TypeScript và Vite**.

---

## 🚀 Tính năng nổi bật

* **Edge Full-Stack All-in-One**: Frontend và Backend API cùng nằm trong 1 project duy nhất, triển khai lên Cloudflare Workers (Static Assets).
* **Turso Cloud SQLite**: Lưu trữ cơ sở dữ liệu trên cloud qua chuẩn HTTP Pipeline v2, tốc độ cực nhanh, chi phí 0đ.
* **Giao diện đa nền tảng (PC & Mobile)**:
  * **PC**: Giao diện bảng Notion-like Spreadsheet Grid, hỗ trợ sắp xếp, lọc và sửa dữ liệu trực quan.
  * **Phone**: Tự động chuyển đổi sang giao diện Danh sách Thẻ (Mobile Card View) kèm **Record Drawer (Bottom Sheet)** trượt từ dưới lên để thao tác bằng 1 tay mượt mà.
* **Bảo mật truy cập**: Hỗ trợ mã Passcode (`APP_AUTH_KEY` / `X-App-Key`) bảo vệ quyền sửa/xóa khi mở web trên Internet.
* **Quản trị Schema**: Thiết kế và thêm/sửa 10 loại dữ liệu cơ bản (`hex_id`, `text_single`, `text_multi`, `int_scalar`, `float_scalar`, `boolean`, `enum_single`, `enum_multi`, `relation_single`, `relation_multi`).

---

## 🛠️ Hướng dẫn Chạy Local

### Cách 1: Chạy bằng file Batch (1-Click)
Nhấp đúp chuột vào file:
```
D:\My Drive\Blue AI\PK Network\run_pk.bat
```

### Cách 2: Chạy bằng dòng lệnh
1. Mở terminal tại thư mục `PK Network`.
2. Khởi động Backend Worker:
   ```bash
   npm run worker:dev
   ```
3. Mở terminal thứ 2 và khởi động Frontend Vite:
   ```bash
   npm run dev
   ```
4. Truy cập giao diện tại:
   * **PC**: `http://localhost:5173`
   * **Điện thoại**: Truy cập theo IP Wi-Fi hiển thị trên terminal (ví dụ: `http://192.168.1.x:5173`).

---

## ☁️ Hướng dẫn Deploy lên Cloudflare (Miễn phí 100%)

1. **Đăng nhập Cloudflare CLI** (chỉ làm 1 lần):
   ```bash
   npx wrangler login
   ```
2. **Cấu hình Secret biến môi trường trên Cloudflare**:
   ```bash
   npx wrangler secret put TURSO_DATABASE_URL
   # Dán URL Turso của bạn vào
   
   npx wrangler secret put TURSO_AUTH_TOKEN
   # Dán JWT Auth Token Turso của bạn vào

   npx wrangler secret put APP_AUTH_KEY
   # Đặt mật khẩu truy cập của bạn
   ```
3. **Triển khai ứng dụng**:
   ```bash
   npm run deploy
   ```
4. Sau khi lệnh chạy xong, bạn sẽ nhận được 1 đường link duy nhất (ví dụ: `https://pk-network.<your-name>.workers.dev`), dùng được từ mọi nơi trên cả máy tính lẫn điện thoại.
