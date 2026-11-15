# HƯỚNG DẪN PHÂN CÔNG VAI TRÒ & VẬN HÀNH NHÓM (8 THÀNH VIÊN)

**Dự án:** Electronics Trading & Exchange Marketplace  
**Học phần:** Nhập môn Công nghệ phần mềm – Nhóm 5  

Với một nhóm **8 người có trình độ tương đương, cùng dùng AI Agent để code** và **bắt buộc ai cũng phải có commit trên GitHub**, cách chia truyền thống (2 người làm BA chỉ viết Word, 2 người làm Tester chỉ điền Excel, 4 người code) **sẽ thất bại** vì:
1. Người làm BA/Tester sẽ không có commit trên GitHub.
2. Nếu 8 người cùng dùng AI code tự do vào chung một chỗ mà không có ranh giới, AI của người này sẽ ghi đè code, sửa cấu trúc DB và phá hỏng code của người kia (Merge Conflict liên tục).

Dưới đây là mô hình vận hành thực tế và tối ưu nhất cho nhóm:

---

## 1. Nguyên tắc chia Role: "Mũ kép" (1 Vai trò CNPM + 1 Module Code độc lập)

Mỗi thành viên sẽ đội **2 chiếc mũ**:
* **Mũ 1 – Vai trò môn học (Functional Role):** Phụ trách đầu mục tài liệu/quy trình theo chuẩn Công nghệ phần mềm (SRS, Thiết kế, Quản lý, Kiểm thử).
* **Mũ 2 – Chủ sở hữu tính năng (Vertical Feature Owner):** Tự dùng AI code trọn gói (Frontend + Backend API + Test) cho **1 phân hệ riêng biệt**.

### Bảng phân công 8 thành viên

| Thành viên | Mũ 1: Vai trò CNPM (Tài liệu & Quy trình) | Mũ 2: Phân hệ Code trên GitHub (Ai cũng có commit) |
| :--- | :--- | :--- |
| **TV 1** | **PM / Scrum Master**<br>Quản lý tiến độ, chia task trên GitHub Projects, ghép slide báo cáo. | **Module Auth & Hồ sơ cá nhân**<br>Đăng ký, Đăng nhập, phân quyền User/Admin (Middleware), xem & sửa Profile. |
| **TV 2** | **System / DB Architect**<br>Thiết kế kiến trúc, vẽ ERD, chốt Database Schema, quản lý nhánh Git (`main'). | **Module Base Setup & Danh mục (Category/Brand)**<br>Dựng khung dự án ban đầu, cấu hình DB + dữ liệu mẫu (Seed), API/UI lấy Category, Brand, xử lý Upload ảnh. |
| **TV 3** | **BA Lead (Phân tích nghiệp vụ)**<br>Chủ trì cấu trúc tài liệu SRS, tổng hợp Use Case & User Stories. | **Module Đăng tin & Quản lý tin bán (Seller Listing)**<br>Tạo tin đăng mới, chọn thông số/tình trạng, bật/tắt nhận trao đổi, trang "Tin đăng của tôi" (sửa, ẩn, xóa tin). |
| **TV 4** | **UI/UX Lead**<br>Thiết kế Wireframe, tạo bộ khung giao diện (Navbar, Footer, Theme màu sắc) thống nhất. | **Module Khám phá, Tìm kiếm & Lọc (Discovery)**<br>Trang chủ, danh sách sản phẩm, thanh tìm kiếm từ khóa, bộ lọc (Danh mục, Hãng, Tình trạng, Giá), Trang chi tiết tin đăng. |
| **TV 5** | **Workflow Analyst (Luồng Mua)**<br>Vẽ sơ đồ trạng thái (State Machine) và Sequence Diagram cho luồng Mua bán. | **Module Yêu cầu mua hàng – Phía Người mua**<br>Nút gửi `PurchaseRequest`, kiểm tra điều kiện hợp lệ (chặn tự mua của mình, chặn gửi trùng), huỷ yêu cầu, trang "Yêu cầu đã gửi". |
| **TV 6** | **Workflow Analyst (Luồng Giao dịch)**<br>Vẽ Activity Diagram & kiểm soát quy tắc khóa sản phẩm khi giao dịch. | **Module Xử lý đơn mua & Lịch sử giao dịch (`Transaction`)**<br>Người bán Chấp nhận/Từ chối yêu cầu mua, tự động đổi trạng thái `Listing`, xác nhận hoàn tất nhận hàng, trang Lịch sử giao dịch. |
| **TV 7** | **BA / Designer (Luồng Trao đổi)**<br>Đặc tả nghiệp vụ và sơ đồ cho luồng Trao đổi thiết bị (`ExchangeOffer`). | **Module Đề nghị Trao đổi thiết bị (`ExchangeOffer`)**<br>Chọn sản phẩm Y của mình để đề nghị đổi lấy sản phẩm X, chấp nhận/từ chối đổi, khóa đồng thời trạng thái cả 2 tin đăng khi hoàn tất. |
| **TV 8** | **QA / Test Lead**<br>Thiết kế khung Test Plan, quản lý danh sách lỗi (Bug log) và kịch bản Demo. | **Module Báo cáo vi phạm (`Report`) & Admin Dashboard**<br>Người dùng bấm Báo cáo tin đăng; trang Admin duyệt/từ chối tin đăng mới, khóa/mở tài khoản User, xử lý Report. |

> **Mẹo để tài liệu cũng tính vào Commit GitHub:** Toàn bộ tài liệu SRS, sơ đồ (vẽ bằng Mermaid) và Test Case không viết trên Word/Excel rời mà viết bằng file Markdown (`.md`) đặt trong thư mục `/docs` của dự án. Ai viết phần nào thì commit thẳng vào GitHub!

---

## 2. Bí quyết để 8 người dùng AI Agent không "đánh nhau"

Khi cả 8 người đều dùng AI Agent (như Antigravity, Cursor, Copilot...), nếu không có "luật chung", 8 con AI sẽ viết 8 kiểu code khác nhau. Nhóm cần làm **Giai đoạn 0 (2–3 ngày đầu Sprint 1)** như sau:

1. **Chốt chung 1 bộ khung (Base Project) trước khi chia nhánh:**
   * **TV 2 (Architect)** cùng **TV 4 (UI Lead)** dùng AI tạo sẵn khung dự án (ví dụ: Next.js Fullstack hoặc React + Express, dùng Prisma ORM + SQLite/PostgreSQL), tạo sẵn **100% các bảng trong Database Schema** (`User`, `Listing`, `Category`, `Brand`, `PurchaseRequest`, `ExchangeOffer`, `Transaction`, `Report`) rồi push lên nhánh chính trước.
   * **Tuyệt đối không để mỗi người tự bảo AI tạo bảng DB riêng**, nếu không khi ghép code sẽ lỗi toàn bộ.
2. **Tạo file `AGENTS.md` (hoặc `CLAUDE.md` / `.cursorrules`) ở thư mục gốc:**
   * Đây là file hướng dẫn dành riêng cho AI Agent. Khi bất kỳ thành viên nào mở dự án lên và ra lệnh cho AI, AI sẽ đọc file này trước.
   * File này quy định rõ: *Cấu trúc thư mục, công nghệ sử dụng, quy tắc đặt tên API, danh sách trạng thái cố định (ví dụ: Listing chỉ có `PENDING`, `ACTIVE`, `IN_TRANSACTION`, `SOLD`, `EXCHANGED`, `HIDDEN`), và phân vùng thư mục của từng thành viên.*

---

## 3. Quy trình vận hành nhóm phần mềm (Theo từng Sprint)

Giảng viên chấm môn CNPM thường nhìn vào **GitHub Insights (Contributors)**, **Pull Requests (PR)** và **Board quản lý task**. Nhóm vận hành theo 5 bước lặp lại mỗi Sprint (2 tuần):

### Bước 1: Đầu Sprint – Họp Sprint Planning (30–45 phút)
* Cả nhóm nhìn vào `agileplan.tsv`, tạo các **Issues** tương ứng trên **GitHub Projects** (dạng bảng Kanban: `To Do` → `In Progress` → `In Review` → `Done`) và gán tên (`Assignee`) cho từng người trong 8 thành viên.

### Bước 2: Tạo nhánh riêng (Branching) – Không ai code trực tiếp trên `main`
* Quy ước 2 nhánh chính: `main` 
* Khi bắt đầu làm task, mỗi người kéo nhánh `main` về và tạo nhánh riêng theo tên mình/tính năng:
  * Ví dụ: `git checkout -b feat/tv1-auth` hoặc `git checkout -b feat/tv7-exchange`.

### Bước 3: Dùng AI Agent để Code + Viết Doc + Viết Test
* Mỗi thành viên bảo AI Agent của mình làm đúng phạm vi được giao, bao gồm:
  1. Code giao diện + API của module đó.
  2. Viết đặc tả Use Case của module đó vào `/docs/srs/module-x.md`.
  3. Viết Test Case / Script kiểm thử cho module đó vào `/tests/module-x.test.ts`.
* **Quy tắc Commit:** Chia nhỏ thành nhiều lần commit có ý nghĩa (ví dụ: 1 commit cho API, 1 commit cho giao diện, 1 commit cho tài liệu/test) để biểu đồ đóng góp trên GitHub của cả 8 người đều đẹp và đều đặn.

### Bước 4: Tạo Pull Request (PR) & Review chéo
* Làm xong, thành viên push nhánh của mình lên GitHub và tạo **Pull Request (PR)** gộp vào nhánh `main`.
* Quy định: **Ít nhất 1 người khác trong nhóm (hoặc PM/Tech Lead) phải vào bấm Review & Approve** trước khi bấm **Merge** (nên chọn *Create a merge commit* thay vì *Squash* nếu muốn giữ nguyên số lượng commit lẻ của từng thành viên trên lịch sử Git).

### Bước 5: Cuối Sprint – Tích hợp & Demo (Sprint Review)
* 2 ngày cuối mỗi Sprint, cả nhóm ngưng thêm tính năng mới, cùng chạy thử trên nhánh `main`, sửa các lỗi lệch dữ liệu giữa các module.
