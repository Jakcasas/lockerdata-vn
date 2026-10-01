# LockerData.VN

Website phân tích bóng đá Việt Nam, tập trung vào V.League. Bản v5 bổ sung nhập sự kiện từ video, điểm theo sự kiện, KDE theo mét và định giá EUR/VNĐ dựa trên kế hoạch V-League Analytics.

## Chạy trên máy

Cần Node.js 18 trở lên. Website không có thư viện ngoài cần cài đặt.

```sh
npm start
```

Mở <http://127.0.0.1:4173/>. Có thể chạy `node server.mjs` nếu máy chưa có npm. Nên dùng server để kho cục bộ hoạt động ổn định.

## Tính năng

- Video & nhập liệu: video cục bộ, đội hình sửa được, đường chuyền hai điểm, chuẩn hóa hướng tấn công, nhiều phiên, nhập/xuất JSON.
- Phân tích sự kiện: Gaussian KDE 105×68m, bộ lọc phút, điểm 1–10 có bảng đóng góp, đối chiếu cầu thủ và tranh chấp có đối thủ.
- Định giá v2: 10 giả định, EUR/VNĐ, lọc bảng xếp hạng, tổng hồ sơ theo CLB và lịch sử kịch bản cục bộ.
- [Hướng dẫn v5, công thức và phạm vi](docs/ban-v5-theo-ke-hoach.md). [Thiết kế PostgreSQL](database/schema.sql) chưa kết nối máy chủ.

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

Các kiểm tra bao gồm 12 trang điều hướng, tách dữ liệu thực/mẫu, danh sách thi đấu, tổng sự kiện, chuẩn hóa xác suất, lọc cầu thủ, KDE theo mét, điểm theo đóng góp, hợp lệ JSON, lưu cục bộ, mô hình giá và máy chủ tĩnh xử lý URL sai.

## Cấu trúc

```text
dist/       Website tĩnh hoàn chỉnh
tests/      Kiểm tra bằng Node.js
docs/       Hướng dẫn sử dụng và dữ liệu
database/   Thiết kế PostgreSQL chưa kết nối
server.mjs  Máy chủ xem trước cục bộ
```

## Đưa website online

Thư mục xuất bản là `dist/`. Các trang dùng hash route nên không cần cấu hình rewrite. Đưa mã nguồn lên GitHub chưa đồng nghĩa website đã được triển khai online.

Xem [hướng dẫn sơ đồ nhiệt](docs/huong-dan-so-do-nhiet.md) và [hướng dẫn dữ liệu](docs/huong-dan-du-lieu.md).
