# Hướng dẫn sử dụng `updateAxiosConfig.js`

## Mục đích
`updateAxiosConfig.js` là một script được sử dụng để tự động cập nhật các file cấu hình `axiosConfig` trong dự án. Điều này giúp đảm bảo các cấu hình luôn đồng bộ và giảm thiểu lỗi do chỉnh sửa thủ công.

## Cách sử dụng

1. **Đảm bảo môi trường**:
   - Node.js đã được cài đặt trên máy.
   - Các file cấu hình `axiosConfig` đã tồn tại trong dự án.

2. **Chạy script**:
   - Mở terminal và điều hướng đến thư mục dự án.
   - Chạy lệnh sau:
     ```bash
     node updateAxiosConfig.js
     ```

3. **Kết quả**:
   - Script sẽ tự động tìm và cập nhật các file `axiosConfig` theo logic được định nghĩa trong `updateAxiosConfig.js`.
   - Nếu có lỗi xảy ra, script sẽ hiển thị thông báo lỗi chi tiết trên terminal.

## Lưu ý
- Trước khi chạy script, hãy đảm bảo bạn đã commit các thay đổi hiện tại để tránh mất dữ liệu.
- Nếu cần tùy chỉnh logic cập nhật, bạn có thể chỉnh sửa file `updateAxiosConfig.js`.

## Ví dụ cấu hình
Dưới đây là một ví dụ về cấu hình `axiosConfig` trước và sau khi chạy script:

**Trước:**
```javascript
// axiosConfig.js
export const axiosConfig = {
  baseURL: 'http://localhost:3000',
  timeout: 5000,
};
```

**Sau:**
```javascript
// axiosConfig.js
export const axiosConfig = {
  baseURL: 'https://api.example.com',
  timeout: 10000,
};
```


