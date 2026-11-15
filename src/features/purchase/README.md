# Feature: Yêu cầu mua — phía Người mua — **TV5**

**Mũ 1:** Workflow Analyst (luồng Mua) — vẽ State Machine & Sequence Diagram

## Bàn giao Sprint 1 (task 1.10)
- SRS và sơ đồ: `docs/srs/module-tv5-purchase.md`.
- `service.ts`: `validatePurchaseRequest` kiểm tra điều kiện gửi;
  `validateCancelPurchaseRequest` kiểm tra quyền và trạng thái cho phép hủy.
- `types.ts`: dữ liệu đầu vào tối thiểu và kết quả validation.
- Unit test: `tests/purchase.test.ts`, chạy `npm test -- tests/purchase.test.ts`.

Các hàm nhận dữ liệu đã nạp và trả `{ valid: true }` hoặc
`{ valid: false, status, error: { code, message } }`, không đọc/ghi DB.
API, truy vấn danh sách và giao diện được triển khai trong Sprint 2.
Khi tích hợp, phải lấy người mua từ phiên đăng nhập và kiểm tra lại dữ liệu
trong transaction trước khi ghi để tránh gửi trùng hoặc ghi đè trạng thái.

## Phạm vi
- Nút "Gửi yêu cầu mua" trên trang chi tiết tin
- Kiểm tra hợp lệ: không tự mua tin của mình, không gửi trùng khi đã có
  yêu cầu `PENDING`, tin phải `ACTIVE`
- Huỷ yêu cầu đã gửi
- Trang "Yêu cầu đã gửi"

## API dự kiến
| Method | Route | Mô tả |
|---|---|---|
| POST | `/api/purchase-requests` | Gửi yêu cầu |
| GET | `/api/purchase-requests?mine=true` | Yêu cầu tôi đã gửi |
| PATCH | `/api/purchase-requests/[id]/cancel` | Huỷ (chỉ khi `PENDING`) |

> Người bán chấp nhận / từ chối thuộc **TV6**:
> `/api/purchase-requests/[id]/accept` và `/api/purchase-requests/[id]/reject`

## Model liên quan
`PurchaseRequest`, `Listing`

## Luật nghiệp vụ
- `offeredPrice > 0`, hoặc `0` = đồng ý giá niêm yết.
- Chỉ tin `ACTIVE` mới nhận yêu cầu.
- Không gửi yêu cầu lên tin của chính mình.
- Huỷ chỉ khi `PENDING` (`canTransitionPurchaseRequest`).

## File được sửa
`src/features/purchase/**`, `src/app/api/purchase-requests/**`,
`src/app/my-requests/**`
