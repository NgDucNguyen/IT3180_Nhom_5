# Feature: Xử lý đơn mua & Lịch sử giao dịch — **TV6**

**Mũ 1:** Workflow Analyst (luồng Giao dịch) — Activity Diagram,
quy tắc khoá sản phẩm.

## Phạm vi
- Người bán **chấp nhận / từ chối** yêu cầu mua
- Khi chấp nhận: tạo `Transaction` (`type = PURCHASE`) và chuyển `Listing`
  sang `IN_TRANSACTION`
- Xác nhận nhận hàng (buyer) / xác nhận đã giao (seller)
- Khi cả 2 xác nhận → `Transaction.COMPLETED`, `Listing` → `SOLD`
- Trang Lịch sử giao dịch

## API dự kiến
| Method | Route | Mô tả |
|---|---|---|
| POST | `/api/purchase-requests/[id]/accept` | Seller chấp nhận → tạo Transaction |
| POST | `/api/purchase-requests/[id]/reject` | Seller từ chối |
| GET | `/api/transactions?role=buyer\|seller` | Lịch sử giao dịch |
| PATCH | `/api/transactions/[id]/confirm` | Xác nhận của từng bên |
| PATCH | `/api/transactions/[id]/cancel` | Huỷ giao dịch |

## Model liên quan
`Transaction`, `PurchaseRequest`, `Listing`

## LUẬT QUAN TRỌNG NHẤT: chống double-booking
Một tin chỉ được nằm trong **1** giao dịch `IN_PROGRESS`. Khi tạo Transaction,
**bắt buộc** dùng `prisma.$transaction` và kiểm tra lại trạng thái listing
(xem `docs/diagrams/erd.md` mục 3).

```ts
await prisma.$transaction(async (tx) => {
  const listing = await tx.listing.findUniqueOrThrow({ where: { id: listingId } });
  if (listing.status !== LISTING_STATUS.ACTIVE) throw new Error("Tin không khả dụng");
  await tx.listing.update({ where: { id: listingId }, data: { status: LISTING_STATUS.IN_TRANSACTION } });
  await tx.purchaseRequest.update({ where: { id: prId }, data: { status: "ACCEPTED" } });
  return tx.transaction.create({ data: { /* ... */ status: "IN_PROGRESS" } });
});
```

## File được sửa
`src/features/transaction/**`, `src/app/api/transactions/**`,
`src/app/my-transactions/**`,
`src/app/api/purchase-requests/[id]/accept/**`,
`src/app/api/purchase-requests/[id]/reject/**`
