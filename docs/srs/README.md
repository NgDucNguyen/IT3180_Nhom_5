# THƯ MỤC SRS — ĐẶC TẢ YÊU CẦU PHẦN MỀM

**Chủ trì:** TV3 (BA Lead) · **Mọi thành viên viết SRS cho module của mình.**

## Cấu trúc khuyến nghị

```
docs/srs/
├─ README.md              # file này — hướng dẫn & mục lục
├─ overview.md            # TV3: tổng quan hệ thống, actor, use case tổng
├─ module-tv1-auth.md     # TV1
├─ module-tv2-catalog.md  # TV2 (đã có)
├─ module-tv3-listing.md  # TV3
├─ module-tv4-discovery.md# TV4
├─ module-tv5-purchase.md # TV5
├─ module-tv6-transaction.md # TV6
├─ module-tv7-exchange.md # TV7
├─ module-tv8-admin-report.md # TV8
└─ test-plan.md           # TV8
```

## Mẫu mỗi file module

```markdown
# SRS — Module <tên> (TVx)

## 1. Mục tiêu
## 2. Actor liên quan
## 3. Use Case
   ### UC-<MODULE>-01: <tên>
   - Actor:
   - Tiền điều kiện:
   - Luồng chính:
   - Luồng thay thế / ngoại lệ:
   - Hậu điều kiện:
## 4. Yêu cầu chức năng (FR)
## 5. Yêu cầu phi chức năng (NFR)
## 6. Ràng buộc dữ liệu & trạng thái
## 7. Tiêu chí chấp nhận (Acceptance Criteria)
## 8. Truy vết (Traceability) — map tới file code + test case
```

## Nguyên tắc

1. Viết **cùng lúc** với code, không dồn cuối kỳ.
2. Mỗi use case phải có **luồng ngoại lệ** — đây là phần giảng viên chấm điểm.
3. Acceptance Criteria phải **kiểm chứng được** (viết thành test case được).
4. Mọi sơ đồ dùng Mermaid, đặt trong file `.md` để commit được lên GitHub.

## Mục lục

| File | Owner | Trạng thái |
|---|---|---|
| [overview.md](overview.md) | TV1 soạn, TV3 tổng hợp | Tổng quan actor, phạm vi, Use Case và quy tắc chung |
| [module-tv1-auth.md](module-tv1-auth.md) | TV1 | Đặc tả Auth Sprint 1 |
| [module-tv2-catalog.md](module-tv2-catalog.md) | TV2 | Hoàn thành (Sprint 1) |
| [module-tv3-listing.md](module-tv3-listing.md) | TV3 | UC-LST-01–04, User Stories, API, ràng buộc và truy vết kiểm thử |
| [module-tv4-discovery.md](module-tv4-discovery.md), [tv4-ui-and-discovery.md](tv4-ui-and-discovery.md) | TV4 | Đặc tả Discovery và UI dùng chung |
| `module-tv5-purchase.md` đến `module-tv8-admin-report.md`, `test-plan.md` | TV5–TV8 | Owner bổ sung trong phạm vi riêng |

Mã Use Case của module tin đăng thống nhất là `UC-LST-01` đến `UC-LST-04`;
User Stories tương ứng là `US-LST-01` đến `US-LST-04`. Khi cập nhật module, owner
giữ cấu trúc mục 1–8 và map tiêu chí chấp nhận tới code/test thật. Mục lục thể hiện
tài liệu hiện có, không thay thế kết quả kiểm thử hoặc xác nhận hoàn thành của owner.
