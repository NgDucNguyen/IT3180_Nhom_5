# Feature: Đề nghị Trao đổi thiết bị — **TV7**

**Mũ 1:** BA/Designer (luồng Trao đổi) — đặc tả + sơ đồ

## Phạm vi
- Người dùng B chọn thiết bị **Y của mình** để đề nghị đổi lấy **X** của A
- Gửi `ExchangeOffer` (có thể kèm `cashTopUp` — tiền bù)
- A chấp nhận / từ chối
- Khi chấp nhận: tạo `Transaction` (`type = EXCHANGE`), **khoá cả 2 listing**
- Trang quản lý đề nghị đã gửi / đã nhận

## API dự kiến
| Method | Route | Mô tả |
|---|---|---|
| POST | `/api/exchange-offers` | Gửi đề nghị (Y ↔ X) |
| GET | `/api/exchange-offers?box=sent\|received` | Danh sách |
| PATCH | `/api/exchange-offers/[id]/accept` | Chấp nhận → tạo Transaction |
| PATCH | `/api/exchange-offers/[id]/reject` | Từ chối |
| PATCH | `/api/exchange-offers/[id]/cancel` | Người gửi huỷ |

## Model liên quan
`ExchangeOffer`, `Transaction`, `Listing`

## Luật nghiệp vụ
- `proposerId !== receiverId` (không tự trao đổi với chính mình)
- `offeredListingId` phải thuộc về `proposerId`
- Cả hai listing phải `ACTIVE`, listing X phải có `allowExchange = true`
- Không gửi trùng khi đã có đề nghị `PENDING` giữa cùng cặp listing
- Khi chấp nhận: khoá **cả hai** listing sang `IN_TRANSACTION` trong
  **một** `prisma.$transaction`
- Khi từ chối: hai listing giữ nguyên `ACTIVE`

## File được sửa
`src/features/exchange/**`, `src/app/api/exchange-offers/**`, `src/app/exchange/**`
