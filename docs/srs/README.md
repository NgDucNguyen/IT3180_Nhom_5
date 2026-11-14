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
| `module-tv2-catalog.md` | TV2 | ✅ Hoàn thành (Sprint 1) |
| Các file còn lại | TV1, TV3–TV8 | ⏳ Chưa tạo |
