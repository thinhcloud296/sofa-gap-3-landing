# Hướng Dẫn Tích Hợp Google Sheets

## Bước 1: Tạo Google Sheet

1. Truy cập [Google Sheets](https://sheets.google.com)
2. Tạo spreadsheet mới, đặt tên: `CASARO SOFA - Đơn hàng`
3. Tạo 2 sheet con:

### Sheet "DonHang" (đổi tên Sheet1):
| Thời gian | Họ tên | SĐT | Địa chỉ | Sản phẩm | Tổng tiền |
|-----------|--------|-----|---------|----------|-----------|

### Sheet "LienHe" (tạo mới):
| Thời gian | Họ tên | SĐT | Địa chỉ |
|-----------|--------|-----|---------|

## Bước 2: Tạo Google Apps Script

1. Trong Google Sheet, vào **Extensions → Apps Script**
2. Xóa code mặc định
3. Copy toàn bộ nội dung từ file `google-apps-script.js` và paste vào
4. Lưu project (Ctrl+S), đặt tên: `CASARO API`

## Bước 3: Deploy Web App

1. Click **Deploy → New deployment**
2. Click icon bánh răng → chọn **Web app**
3. Cấu hình:
   - Description: `CASARO API v1`
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Click **Deploy**
5. Click **Authorize access** → Chọn tài khoản Google → Allow
6. **COPY URL** được hiển thị (dạng: `https://script.google.com/macros/s/xxx/exec`)

## Bước 4: Cập nhật URL trong code

### Trong file `index.html`:
Tìm dòng:
```javascript
var GOOGLE_SHEET_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';
```
Thay bằng URL bạn vừa copy.

### Trong file `products.min.js`:
Bạn cần minify lại file `products.js` sau khi thêm code Google Sheets.

Hoặc tìm và thay thế trong file minified:
- Tìm: `YOUR_GOOGLE_APPS_SCRIPT_URL_HERE`
- Thay: URL của bạn

## Bước 5: Test

1. Mở website
2. Điền form liên hệ hoặc đặt hàng
3. Kiểm tra Google Sheet xem dữ liệu đã được ghi chưa

## Lưu ý quan trọng

### Nếu cần cập nhật code Apps Script:
1. Sửa code trong Apps Script
2. **Deploy → Manage deployments → Edit → New version → Deploy**
3. URL không đổi

### Bảo mật:
- URL Apps Script có thể bị lộ trong source code
- Để bảo mật hơn, có thể thêm validation trong Apps Script
- Hoặc sử dụng backend server riêng

### Giới hạn miễn phí:
- Google Apps Script: 20,000 requests/ngày
- Đủ cho website bán hàng nhỏ

## Troubleshooting

### Không nhận được dữ liệu:
1. Kiểm tra URL đã đúng chưa
2. Kiểm tra đã Deploy đúng cách chưa
3. Mở Console (F12) xem có lỗi không

### Lỗi CORS:
- Code đã sử dụng `mode: 'no-cors'` để bypass
- Dữ liệu vẫn được gửi dù không nhận response

### Test Apps Script:
- Truy cập URL với method GET để test: `https://script.google.com/macros/s/xxx/exec`
- Sẽ hiển thị: `{"success":true,"message":"API is working!"}`
