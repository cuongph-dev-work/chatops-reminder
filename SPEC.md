**SPEC: ChatOps Reminder Extension (Plasmo + React)**



1\. Tổng quan dự án (Project Overview)

Mục tiêu: Xây dựng một Chrome Extension giúp người dùng tạo nhắc nhở (reminder) trực tiếp từ các tin nhắn trên nền tảng ChatOps (đặc biệt là Mattermost) mà không cần rời khỏi màn hình chat.



Đối tượng sử dụng: Đội ngũ phát triển, PM, QC, HR (như trong ảnh) thường xuyên nhận task/thông báo qua chat.



Tech Stack: \* Framework: Plasmo (chuyên dụng cho Chrome Extension).



UI/Logic: ReactJS + TypeScript.



Styling: TailwindCSS (khuyến nghị để style Modal/Popup nhanh gọn).



Nền tảng: Chrome Extension Manifest V3.



2\. Các tính năng cốt lõi \& nâng cao (Features)

2.1. Tính năng In-app Injection (Nút "Remind Me")

Mô tả: Extension tự động chèn một nút "Remind Me ⏰" vào menu hành động (dấu 3 chấm) của mỗi tin nhắn trên giao diện web Mattermost.



Hành vi: \* Click vào nút sẽ mở ra một Modal (Hộp thoại Form) hiển thị đè lên giao diện chat (sử dụng công nghệ CSUI của Plasmo với Shadow DOM để tránh xung đột CSS).



Hệ thống tự động trích xuất và điền sẵn Link tin nhắn vào form.



2.2. Modal Cấu hình Nhắc nhở (Reminder Form)

Form trên Modal cho phép người dùng nhập các thông tin sau:



Nội dung (Title): Tiêu đề hoặc ghi chú tóm tắt cho nhắc nhở.



Thời gian (Date/Time): Chọn ngày và giờ muốn được nhắc.



Nhắc trước (Pre-reminder): Dropdown chọn nhắc trước X phút (Ví dụ: Đúng giờ, 5p, 10p, 15p, 30p trước thời hạn).



Phân loại (Tags \& Colors): Cho phép chọn hoặc tạo Tag (ví dụ: Bug, Task, Meeting, HR) kèm theo màu sắc (Badge color) để dễ phân biệt.



Lặp lại (Recurring): Checkbox/Dropdown để set lịch lặp lại (Ví dụ: Hàng ngày, Hàng tuần vào Thứ 2, Hàng tháng).



2.3. Hệ thống Thông báo \& Báo lại (Notification \& Snooze)

Thông báo hệ điều hành: Đến giờ (hoặc trước X phút), bắn Native Notification của Chrome.



Hành động trên Thông báo:



Click vào thân thông báo: Tự động mở một Tab mới dẫn thẳng đến Link tin nhắn đã lưu.



Nút "Snooze" (Báo lại): Cung cấp 1-2 nút Action trên thông báo (vd: "Snooze 5 mins", "Snooze 10 mins"). Khi click, hệ thống lùi thời gian báo thức lại tương ứng.



2.4. Trình Quản lý (Extension Popup)

Mô tả: Giao diện hiển thị khi người dùng click vào icon của Extension trên thanh công cụ trình duyệt.



Chức năng (CRUD):



Xem danh sách toàn bộ các Reminder đang chờ (Sắp xếp theo thời gian hoặc theo Tag).



Chỉnh sửa nội dung/thời gian của Reminder.



Xóa/Hủy (Cancel) Reminder.



Quản lý danh sách Tag.



3\. Kiến trúc Kỹ thuật (Technical Architecture)

Để hiện thực hóa các tính năng trên, dự án sẽ chia làm 3 module chính theo chuẩn Plasmo:



Content Script UI (CSUI) - contents/



Sử dụng MutationObserver để theo dõi DOM của Mattermost, phát hiện khi menu 3 chấm mở ra để inject nút "Remind Me".



Render React Component (Modal Form) bằng Shadow DOM.



Background Service Worker - background/index.ts



Sử dụng chrome.alarms để lên lịch chạy ngầm chính xác (cả alarm gốc và alarm cho Snooze/Recurring).



Sử dụng chrome.notifications để hiển thị popup. Lắng nghe event onButtonClicked để xử lý logic Snooze.



Storage \& State - @plasmohq/storage



Dùng để lưu trữ tập trung mảng danh sách các Reminder.



Đảm bảo dữ liệu đồng bộ realtime giữa Content Script (khi tạo mới) và Popup (khi xem danh sách).

