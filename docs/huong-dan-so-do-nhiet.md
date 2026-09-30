# LockerData.VN v4 — Sơ đồ nhiệt của một cầu thủ trong một trận

## Sử dụng

1. Mở `index.html` sau khi giải nén gói website, hoặc mở bản xem trước đang chạy trên máy tại http://127.0.0.1:4173/#heatmap.
2. Chọn **Nhiệt cầu thủ** ở thanh điều hướng. Mặc định: Nguyễn Quang Hải, trận mẫu LD-01 Hà Nội 2–1 Công an Hà Nội.
3. Chọn cầu thủ; chọn cả trận, hiệp 1, hiệp 2 hoặc nhập khoảng phút rồi bấm **Áp dụng**. Bấm cột trong biểu đồ 15 phút cũng đổi khoảng phân tích.
4. Đổi giữa **Mật độ** và **Điểm chạm**, hoặc bật lớp điểm chạm trên bản đồ mật độ. Danh sách lần chạm nằm bên dưới biểu đồ.
5. Bấm **Tải sơ đồ SVG** để lưu bản đồ đang lọc. File giữ tên cầu thủ, mã trận, khoảng phút và nhãn mô phỏng.

Trong hồ sơ cầu thủ có dữ liệu mẫu phù hợp, nút sơ đồ nhiệt mở đúng cầu thủ của trận LD-01. Hồ sơ chưa có tọa độ sẽ báo thiếu dữ liệu. URL lưu cầu thủ, trận và khoảng phút để mở lại đúng lựa chọn.

## Cách đọc

- Mật độ làm mượt từ các tọa độ chạm bóng, với cùng thang màu trong toàn trận của một cầu thủ. Không so sánh trực tiếp cường độ màu giữa hai cầu thủ vì thang màu được chuẩn hóa riêng.
- Biểu tượng ⊕ là trung bình tọa độ các lần chạm trong bộ lọc, không phải vị trí trung bình từ tracking liên tục.
- Thống kê chia sân thành ba phần theo chiều dọc và ba phần theo chiều ngang; tổng mỗi nhóm là 100% khi có sự kiện.
- x đi từ sân nhà tới khung thành đối phương; y từ cánh trái tới cánh phải theo hướng tấn công đã chuẩn hóa.
- Chạm bóng không đại diện cho toàn bộ quãng đường chạy hoặc thời gian có mặt trong một khu vực.

## Trạng thái dữ liệu

LD-01 là kịch bản mô phỏng cố định, gồm 22 cầu thủ và 880 lần chạm. Quang Hải có 38 lần chạm trong toàn trận mẫu. Không phải dữ liệu trận thật, dữ liệu Opta hay tracking thực tế.

Lựa chọn trận VPF Hà Nội–CAHN ngày 08/03/2026 chỉ có danh sách thi đấu được xác minh. Khi chọn trận này, website hiển thị **Chưa có tọa độ cho trận này**, không vẽ bản đồ giả làm dữ liệu thật.

## Kiểm tra và xuất bản

Đã kiểm tra 10 trang, 22 cầu thủ theo trận, tổng số liệu khu vực, hiệp 1 + hiệp 2 = cả trận, giới hạn khoảng phút, liên kết hồ sơ và trạng thái thiếu dữ liệu. Kiểm tra trình duyệt desktop và mobile 390px không có lỗi console hoặc tràn ngang trang.

Xuất bản Sites vẫn chưa thành công do môi trường không kết nối được máy chủ Git hosting qua proxy. Địa chỉ 127.0.0.1 là bản xem trước cục bộ. Gói ZIP là website tĩnh hoàn chỉnh, chưa phải xác nhận website đã online.
