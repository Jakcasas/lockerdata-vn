# LockerData.VN — Bản nâng cấp v3

Cập nhật: 27/09/2026. Website tĩnh, không cần cài thư viện để mở và không chứa khóa API.

## Mở website

Giải nén `LockerData-VN-v3.zip`, mở `index.html`. Khi đưa lên dịch vụ lưu trữ website tĩnh, dùng thư mục chứa `index.html` làm thư mục xuất bản. Các trang dùng hash route nên không cần quy tắc rewrite.

Bản đang chạy trên máy: http://127.0.0.1:4173/#analytics. Đây là địa chỉ cục bộ, không phải website online.

## Tính năng bổ sung

- **Phân tích trận:** chọn đội, cầu thủ, hiệp và giới hạn phút; sơ đồ nhiệt từ tọa độ sự kiện; bản đồ cú sút và bảng chi tiết; xG tích lũy; biểu đồ số lần chạm ở 1/3 sân tấn công theo từng 5 phút.
- **Thống kê cầu thủ trong trận:** số chạm bóng, sút, xG, bàn; sắp xếp theo chỉ số; bấm tên để xem vùng hoạt động. Bảng luôn liệt kê cả đội trong khoảng thời gian đã chọn; các thẻ chỉ số và bản đồ lọc theo cầu thủ được chọn.
- **Đội hình thi đấu:** trận Hà Nội–CAHN ngày 08/03/2026 tại Hàng Đẫy; 22 cầu thủ đá chính, 18 dự bị, tên hai HLV, số áo, nhóm vị trí, số trận và bàn trước trận theo tài liệu VPF. Bố trí trên sân chỉ minh họa nhóm vị trí, không xác nhận sơ đồ chiến thuật. Chưa có phút thay người thực tế.
- **Tỉ lệ kết quả thực tế trước trận:** Hà Nội 6 thắng, 3 hòa, 5 thua; CAHN 11 thắng, 2 hòa, 0 thua, theo tờ đăng ký VPF. Đây là lịch sử tại thời điểm tài liệu, không phải xác suất dự báo.
- **Mô hình thắng–hòa–thua:** Poisson độc lập, λ do người dùng điều chỉnh, cộng các tỉ số 0–30 rồi chuẩn hóa. Hiển thị tổng 100%, ghi rõ chưa hiệu chỉnh và không phải xác suất trực tiếp.
- **Thị trường chuyển nhượng:** 8 thông báo gia nhập/gia hạn từ CLB; bộ lọc loại giao dịch và CLB, tìm tên có hoặc không dấu. Phí và thời hạn chưa xác minh được để trống theo nghĩa dữ liệu, không gán 0 €.
- Giữ các hồ sơ, so sánh, xuất CSV, định giá thử nghiệm và kết quả VPF của bản trước.

## Dữ liệu thực và dữ liệu mô phỏng

**Có nguồn:** kết quả vòng 18 trong bản trước; đội hình lưu trữ và thành tích trước trận ngày 08/03/2026; 8 thông báo chuyển nhượng được đối chiếu ngày 27/09/2026. Các bản ghi được cập nhật thủ công, chưa tự đồng bộ.

**Mô phỏng:** 880 lần chạm, 25 cú sút và xG trong phòng phân tích; hồ sơ mùa mẫu, điểm LD và định giá mẫu của bản trước. Sự kiện phân tích không mô tả trận thật ngày 08/03/2026. Chưa kết nối dữ liệu Opta, API trực tiếp hoặc tracking V.League.

## Nguồn chính thức

- VPF — danh sách đăng ký Hà Nội–CAHN: https://vpf.vn/tai-lieu-vleague/vleague-thong-bao/danh-sach-dang-ky-thi-dau-clb-ha-noi-vs-clb-cong-an-ha-noi-vong-15-vdqg-lpbank-2025-26/
- CAHN — gia hạn Đoàn Văn Hậu, Lê Phạm Thành Long, Trần Đình Trọng, Alan Grafite: https://cahnfc.com/tin-tuc/THONG-CAO-BAO-CHI-or-CLB-CONG-AN-HA-NOI-GIA-HAN-HOP-DONG-VOI-04-CAU-THU-CHU-CHOT.769
- CAHN — Damià Sabater: https://cahnfc.com/en/tin-tuc/CHINH-THUC-CLB-CONG-AN-HA-NOI-CHIEU-MO-TIEN-VE-DAMIA-SABATER-TU-TAY-BAN-NHA.796
- Hà Nội FC — video chào mừng Cyrus Christie, Adam Taggart, Aymeric Faurand-Tournaire: https://hanoifc.com.vn/video

Ngày trên thẻ chuyển nhượng là ngày đăng của nguồn, không tự xem là ngày hợp đồng có hiệu lực.

## Kiểm tra và trạng thái xuất bản

Đã kiểm tra 9 trang, đủ 40 tên trong danh sách thi đấu, cộng gộp sự kiện theo đội/cầu thủ/hiệp, mốc phút 0, các kịch bản Poisson, tìm tên không dấu, bộ lọc và trạng thái thiếu dữ liệu V.League 2. Kiểm tra trình duyệt trên desktop và màn hình rộng 390px: không tràn trang theo chiều ngang; menu đóng sau chuyển trang; không ghi nhận lỗi console. Đã sửa máy chủ xem trước để tìm `dist` theo vị trí file, không phụ thuộc thư mục khởi động.

Xuất bản Sites chưa thành công: kết nối Git tới `git.chatgpt-team.site:443` qua proxy của môi trường bị lỗi. Chưa có URL online được xác minh và chưa có bản v3 công khai. Gói ZIP chứa toàn bộ tài nguyên website tĩnh để bàn giao; không chứa thông tin đăng nhập.
