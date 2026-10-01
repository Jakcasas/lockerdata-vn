# LockerData.VN v5 — triển khai từ kế hoạch V-League Analytics

Tên LockerData.VN được giữ theo yêu cầu. File kế hoạch là tài liệu tham chiếu sản phẩm, không phải nguồn dữ liệu trận đấu hay bằng chứng được cấp quyền Opta.

## Những phần đã chạy

| Phần trong kế hoạch | Triển khai |
|---|---|
| Video tagging | Mở video cục bộ, tốc độ 0.5/0.75/1/1.5, Space phát/dừng, lấy giờ + offset, P/S/T/D/I và chọn 11 cầu thủ đá chính |
| Sự kiện tọa độ | Sân 105×68 mét, chuyền hai điểm, chuẩn hóa hướng tấn công bằng xoay 180° khi sang trái |
| Kho sự kiện | Nhiều phiên trên localStorage, sửa metadata và đội hình, nhập/xuất JSON có kiểm tra dữ liệu |
| Điểm 1–10 | Nền 6 + các đóng góp sự kiện, hệ số vai trò, sổ cộng/trừ, phiên bản LD-events-1.0 |
| KDE | Gaussian 2 chiều, h=4.5m mặc định, điều chỉnh 2–10m, lọc thời gian, SVG có nhãn xuất xứ |
| Phân tích trận | Nhịp sự kiện 5 phút, điểm đá chính/dự bị, đối chiếu hai cầu thủ, tranh chấp có đối thủ gắn rõ |
| Định giá | EUR và tổng lót tay mô phỏng VNĐ; 10 tham số chỉnh được; tuổi/hợp đồng/tuyển/giải/nhu cầu/danh tiếng |
| Bảng thị trường | Xếp hạng 18 hồ sơ mẫu, lọc vị trí/tuổi/CLB, tổng hồ sơ CLB, lưu 20 kịch bản |
| CSDL | database/schema.sql: clubs, players, matches, appearances, events, ratings, contracts, valuation_scenarios |

## Quy trình sử dụng

1. Chạy `node server.mjs`, mở `http://127.0.0.1:4173/#studio`.
2. Tạo phiên. Sửa tên trận, ngày, mùa và nguồn; lưu thông tin.
3. Xác nhận đội hình. Danh sách ban đầu là Hà Nội–CAHN 08/03/2026, chỉ dùng làm khung chỉnh sửa. Cầu thủ và số áo cần phù hợp video đang xem.
4. Chọn file video, phát chậm. Nút lấy giờ video cộng offset nhập tay. Video biên tập/cắt cảnh cần đối chiếu đồng hồ trận, không chỉ dùng thời lượng video.
5. Chọn cầu thủ, loại sự kiện, phút/giây/hiệp, hướng tấn công; bấm điểm đầu. Chuyền và key pass cần điểm nhận. Chọn kết quả và ghi.
6. Đổi hướng khi hai đội đổi sân; hệ tọa độ lưu luôn tấn công sang phải. y cũng xoay khi đổi hướng.
7. Mở “Phân tích sự kiện” để chọn cầu thủ, khoảng phút, KDE và đối chiếu đối thủ. Mỗi sự kiện là một quan sát không gian, chưa phải tracking liên tục.
8. Xuất JSON thường xuyên. Đóng trình duyệt/xóa dữ liệu trang/đổi tên miền hoặc chuyển máy có thể mất kho cục bộ. Video không được nhúng vào JSON hay tải lên máy chủ.

Có thể nhập `docs/events-example-v1.json` để thử 61 sự kiện mô phỏng của hai cầu thủ giả định. File có nhãn `sample`, không gán cho một trận V.League thực. Trong trang phân tích, bấm **Áp dụng bộ lọc** sau khi điền khoảng phút. Trong trang định giá, bấm **Tính lại kịch bản** sau khi chỉnh tham số.

Không ghi cùng một cú sút hai lần bằng `shot` và `goal`; chọn `goal` cho cú đã thành bàn. Cũng tránh ghi trùng `pass` và `key_pass`. Chưa có công cụ tự phát hiện bản ghi trùng về ngữ nghĩa. Hoàn tác bỏ sự kiện được thêm gần nhất, không phải sự kiện có phút lớn nhất.

## Điểm và giới hạn

`LD-events-1.0` dùng trọng số từ kế hoạch. Goal ×1.3 DF, ×1.1 MF, ×0.9 FW; key pass DF ×1.2; bỏ lỡ FW ×1.2, khác ×0.8; tắc bóng DF/MF ×1.1. Đánh chặn chỉ cộng khi đánh dấu nguy hiểm trong vùng cấm; DF/GK ×1.2. Mất bóng nguy hiểm DF ×1.3. Cứu thua GK +0.25 đến +0.50 theo `0.25 + 0.25*xGOT`; thiếu xGOT lấy +0.25. Thẻ đỏ là đỏ trực tiếp.

Các vai trò tổng quát DF/MF thay cho phân nhóm hậu vệ biên/tiền vệ trụ trong kế hoạch. Team bonus chưa có công thức cụ thể nên bằng 0. Bản ghi chưa có sự kiện nhận điểm `null`/“—”, không tự chấm 6. Điểm từ phiên thiếu sự kiện chỉ là tạm, không công bố như điểm chính thức toàn trận.

xG/xGOT chỉ tổng hợp giá trị được nhập có nguồn. Chưa huấn luyện mô hình xG. Chưa suy ra tốc độ, cự ly chạy, tỷ lệ kiểm soát bóng hay radar thể chất từ điểm chạm. Heatmap đối chiếu dùng thang màu riêng; chỉ so phân bố, không so cường độ tuyệt đối. KDE chưa hiệu chỉnh mật độ tại biên sân.

## Mô hình giá

`LD-value-2.0`: base × (rating×0.35 + output×0.25) × tuổi × tuyển × hợp đồng × tier.

EUR làm tròn 1.000. VNĐ lấy EUR trước làm tròn × tỷ giá × nhu cầu × danh tiếng, làm tròn 1 triệu. 26.500 VNĐ/EUR là tỷ giá kịch bản, không lấy trực tiếp. Tuổi 22–24 ×1.15, 29–31 ×0.85; hợp đồng 0/≤6/≤12/≤24/>24 tháng lần lượt ×0.6/0.75/0.9/1/1.1 là lựa chọn bổ sung để công thức chạy được. Giá nền và các hệ số cần hiệu chỉnh bằng giao dịch thực sau này.

Chỉ số đóng góp mặc định trong bảng = (bàn + kiến tạo)/90 phút ×10, chặn 0–10; chỉ là ví dụ, chưa cân bằng theo vị trí. Form cho phép thay output thủ công. Không phải Transfermarkt hay phí lót tay xác nhận; không có phí chuyển nhượng thật khi nguồn chưa công bố.

## Những phần cần giai đoạn máy chủ

Website hiện vẫn là ứng dụng tĩnh. Chưa triển khai Next.js/FastAPI, đăng nhập, API đồng bộ, PostgreSQL thực, Redis, WebSocket, storage cloud hay pipeline tự cập nhật. SQL là thiết kế chưa thực thi; cần auth/phân quyền, kiểm duyệt, migration có phiên bản, importer kiểm tra đội của opponent và dữ liệu cấp phép trước triển khai.

Lịch sử nhiều mùa và hồ sơ hợp đồng thực cần ID cầu thủ ổn định, nguồn xác minh và dữ liệu đầy đủ; chưa ghép cầu thủ giữa các phiên theo tên. Chưa bổ sung hàng trăm hồ sơ giả để lấp kho. Kết quả/đội hình/chuyển nhượng VPF và CLB trong các trang cũ vẫn là bản lưu trữ cập nhật thủ công, không phải live.

Chưa có tài khoản/API Opta được cấp quyền. Kế hoạch nhân sự, vận hành 12 tuần, premium/fantasy và thương mại chưa triển khai trong bản MVP này.
