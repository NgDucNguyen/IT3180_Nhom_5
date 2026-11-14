# THƯ MỤC TEST — QUY ƯỚC

**Chủ trì:** TV8 (QA / Test Lead) · **Ai cũng phải viết test cho module của mình.**

## Cách đặt file

```
tests/
├─ listing-state.test.ts        # TV2 - state machine
├─ api-catalog.test.ts          # TV2 - smoke test /api/categories, /api/brands
├─ auth.test.ts                 # TV1
├─ listing.test.ts              # TV3
├─ discovery.test.ts            # TV4
├─ purchase-request.test.ts     # TV5
├─ transaction.test.ts          # TV6
├─ exchange-offer.test.ts       # TV7
└─ report-admin.test.ts         # TV8
```

## Quy ước

1. Mỗi file test thuộc sở hữu của **người tạo ra nó** — không sửa test của người khác.
2. Tối thiểu: **1 test happy path + 1 test case lỗi** cho mỗi API/hàm chính.
3. Test phải chạy **offline**, không gọi mạng.
4. Test cần DB thì dùng dữ liệu seed; nhớ dọn dẹp sau khi xong.
5. Chạy trước khi commit:

```bash
npm test          # chạy toàn bộ
npm run check     # typecheck + test (bắt buộc trước khi mở PR)
```

> `.env` được nạp tự động trong `vitest.config.ts` — không cần export tay.
> Nếu chưa có DB: `npx prisma db push && npx prisma db seed`.

## Trạng thái hiện tại

| File | Owner | Nội dung | Số test |
|---|---|---|---|
| `listing-state.test.ts` | TV2 | Quy tắc chuyển trạng thái Listing / PurchaseRequest / Transaction | 9 |
| `api-catalog.test.ts` | TV2 | Smoke test 2 API danh mục & thương hiệu (gọi thẳng route handler) | 4 |

> TV8 chịu trách nhiệm tổng hợp kết quả test vào `docs/srs/test-plan.md`.
