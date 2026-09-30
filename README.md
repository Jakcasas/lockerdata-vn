# LockerData.VN

Website phân tích bóng đá Việt Nam, tập trung vào V.League. Bản v4 có thống kê cầu thủ, phân tích trận, đội hình thi đấu, thông báo chuyển nhượng và sơ đồ nhiệt của một cầu thủ trong một trận.

## Chạy trên máy

Cần Node.js 18 trở lên. Website không có thư viện ngoài cần cài đặt.

```sh
npm start
```

Mở <http://127.0.0.1:4173/>. Bạn cũng có thể mở trực tiếp `dist/index.html` trong trình duyệt.

## Tính năng

- Kết quả V.League lưu trữ có nguồn VPF; tách riêng chế độ trận mẫu.
- Hồ sơ cầu thủ, so sánh, số liệu trên 90 phút, xuất CSV và định giá thử nghiệm.
- Biểu đồ xG tích lũy, bản đồ cú sút và số lần chạm trong vùng tấn công.
- Đội hình Hà Nội–CAHN ngày 08/03/2026: đá chính, dự bị, HLV và thành tích trước trận theo danh sách VPF.
- Thông báo gia nhập, gia hạn từ câu lạc bộ và bộ lọc thị trường chuyển nhượng.
- Sơ đồ nhiệt cá nhân: chọn cầu thủ, trận, hiệp, khoảng phút, mật độ hoặc điểm chạm; phân bố theo vùng sân, vị trí chạm trung bình, tải SVG.
- Mô hình xác suất thắng–hòa–thua Poisson có thể điều chỉnh.

## Trạng thái dữ liệu

Các kết quả lưu trữ, danh sách thi đấu và thông báo chuyển nhượng có liên kết nguồn trong giao diện. Các bản ghi này được cập nhật thủ công, chưa tự đồng bộ.

Tọa độ sự kiện, xG, hồ sơ mùa mẫu, điểm LD, định giá và dự báo là **dữ liệu mô phỏng hoặc mô hình thử nghiệm có nhãn**. Chưa kết nối API trực tiếp, Opta hoặc dữ liệu tracking V.League. Trận thực chưa có tọa độ sẽ báo thiếu dữ liệu thay vì vẽ sơ đồ nhiệt suy đoán.

## Kiểm tra

```sh
npm test
```

Các kiểm tra bao gồm trang điều hướng, tách dữ liệu thực/mẫu, danh sách thi đấu, tổng số liệu sự kiện, chuẩn hóa xác suất, lọc cầu thủ và sơ đồ nhiệt theo khoảng phút.

## Cấu trúc

```text
dist/       Website tĩnh hoàn chỉnh
tests/      Kiểm tra bằng Node.js
docs/       Hướng dẫn sử dụng và dữ liệu
server.mjs  Máy chủ xem trước cục bộ
```

## Đưa website online

Thư mục xuất bản là `dist/`. Các trang dùng hash route nên không cần cấu hình rewrite. Đưa mã nguồn lên GitHub chưa đồng nghĩa website đã được triển khai online.

Xem [hướng dẫn sơ đồ nhiệt](docs/huong-dan-so-do-nhiet.md) và [hướng dẫn dữ liệu](docs/huong-dan-du-lieu.md).
