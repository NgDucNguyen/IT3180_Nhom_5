# Feature: Yêu cầu mua — phía Người mua — **TV5**

**Mũ 1:** Workflow Analyst (luồng Mua) — vẽ State Machine & Sequence Diagram

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
