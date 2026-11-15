# Kế hoạch TV1 — Sprint 1

## Nhánh và phạm vi

- Nhánh: feat/tv1-auth-sprint1, từ origin/main vì remote chưa có develop.
- Mục tiêu: đăng ký → đăng nhập → me → đăng xuất; form đăng ký/đăng nhập và hồ sơ đọc.
- Không đổi schema, dependencies, Navbar, middleware hoặc API cập nhật hồ sơ Sprint 2.
- Đã soạn docs/srs/overview.md theo nhiệm vụ TV1 trong MEMBER-GUIDEBOOK; TV3 review tổng quan và chủ trì SRS.

## Thứ tự và đầu ra

1. Kiểm tra Git, đọc quy ước, tạo nhánh riêng và cài dependencies khóa trong package-lock.
2. Ghi SRS: Use Case, ngoại lệ, AC, API contract, ràng buộc và sơ đồ Mermaid.
3. Tạo helper JWT/cookie/current-user/guard, validation và bốn Auth Route Handler.
4. Form /login và /register bằng shared UI; /profile đọc user và đăng xuất.
5. Integration test bằng SQLite: bcrypt, validation, cookie, JWT giả/hết hạn, guard và LOCKED.
6. Khởi tạo DB local, seed; chạy npm run check, npm run build và thử qua dev server.
7. Kiểm tra diff đúng phạm vi; chia ba commit tài liệu/API/UI-test, push nhánh cá nhân, mở PR vào develop; chờ review của thành viên khác.

## Commit dự kiến

- docs(auth): đặc tả Auth và kế hoạch Sprint 1 [TV1]
- feat(auth): API xác thực và phiên cookie JWT [TV1]
- feat(auth): form đăng nhập đăng ký và kiểm thử [TV1]

## Prompt và tự rà soát

Yêu cầu: thành viên số 1; đọc repo, lập nhánh riêng và tiến hành đầu việc cần thiết.
Phạm vi thực hiện được chọn theo TV1 Sprint 1 trong MEMBER-GUIDEBOOK.md.
Rà soát: không lộ hash/token; không nhận role từ client; không tin cookie role;
chặn LOCKED kể cả phiên cũ; password 72 byte; email unique; logout cùng cookie path;
không sửa file người khác; không thêm thư viện.

Kết quả kiểm chứng thực tế được ghi bên dưới.

## Kết quả thực hiện

- Đã hoàn tất tài liệu, code và kiểm chứng; nhánh bàn giao feat/tv1-auth-sprint1, PR đích develop.
- Node 22 được cài tách biệt tại `/tmp/it3180-node22`; không thay Node hệ thống.
  Trong môi trường hiện tại, dùng:
  `export PATH=/tmp/it3180-node22/node_modules/node/bin:$PATH` trước các lệnh npm.
- Dependencies giữ nguyên lockfile; .env dùng secret ngẫu nhiên và DB local đều bị Git ignore.
- npm run check: TypeScript pass, 59/59 test pass (37 Auth + 22 test sẵn có).
- npm run build: pass; git diff --check: pass.
- HTTP smoke trên npm run dev cổng 3180: /login và /register trả 200 và có form;
  /profile guest chuyển 307 đến /login; tài khoản demo đăng nhập → me → profile thành công;
  logout xóa cookie và me không cookie trả 401.
- Phát hiện khi thử HTTP: Next.js chuẩn hóa URL thành localhost, gây sai Origin với 127.0.0.1.
  Đã dùng Host thực và bổ sung test hồi quy; chặn cross-site vẫn được kiểm thử.
- Next.js tự sinh thay đổi AGENTS.md và next-env.d.ts khi chạy dev;
  đã khôi phục đúng bản gốc sau khi dừng server, không đưa vào thay đổi TV1.
- Đã kiểm thử Chrome tự động bằng Playwright với Chrome có sẵn; driver cài ngoài repo tại /tmp/it3180-browser.
  Đăng ký bằng form, chặn phone chỉ có dấu phân cách trước HTTP, cookie httpOnly không đọc được
  bằng document.cookie, me trả đúng phone, reload giữ phiên, logout xóa cookie, guest bị chuyển
  về login khi mở profile, đăng nhập sai hiện lỗi và đăng nhập lại đúng đều PASS.
  Login/register ở viewport 375px không tràn ngang; không có lỗi JavaScript chưa xử lý.
  Đã chạy lại với kiểm tra cảnh báo hydration: PASS. Screenshot dùng caret=initial để
  tránh driver tự chèn style vào input trước khi React hydrate.
  Kịch bản chạy lại: tests/auth-browser.mjs; ảnh review đã lưu tại src/features/auth/evidence.
  README Auth mô tả cách cài driver test ngoài repo và chạy script bằng Node 22.
  Tài khoản browser test được dọn sau khi chạy.
- Đã tạo develop từ baseline main f4cabdfc00e72f6fc95e70114d991d82e1021179, không đổi main.
- Quy trình bàn giao: ba commit theo mục trên, push nhánh TV1, mở PR vào develop.
  Chỉ được merge sau khi ít nhất một thành viên khác approve; không tự approve/merge.
- Cần TV3 review overview.md; TV4 tích hợp Navbar ở Sprint 2.
- Rà soát tổng quan ghi nhận cạnh ACTIVE → PENDING còn thiếu trong helper của TV2;
  không sửa ngoài phạm vi, ghi trong overview để TV2/TV3 xử lý khi làm sửa tin ở Sprint 2.

## Sửa lỗi sau rà soát

- Đã sửa phone chỉ có dấu phân cách vẫn hợp lệ: cần 8–15 chữ số thực, tổng tối đa 20 ký tự.
- Quy tắc dùng chung tại src/features/auth/phone.ts, được form và API cùng sử dụng.
- Thêm 13 test cho phone sai, biên 8/15 chữ số, định dạng có dấu phân cách và giá trị tùy chọn.
- SRS cập nhật cùng quy tắc; không đổi dependency hoặc schema của dự án.
