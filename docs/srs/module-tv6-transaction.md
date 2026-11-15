# Module TV6 — Xử lý đơn mua & Lịch sử giao dịch

> **Tác giả:** TV6 · **Sprint:** 1 · **Nhóm 5 — IT3180**

## 1. Mục tiêu và phạm vi
Người bán chấp nhận hoặc từ chối yêu cầu mua. Chấp nhận thì hệ thống khóa tin đăng
và sinh một `Transaction`. Hai bên xác nhận để hoàn tất, hoặc một bên hủy để mở khóa.
Thanh toán, vận chuyển, gặp mặt nằm **ngoài hệ thống** (Out of Scope).

## 2. Tác nhân
| Tác nhân | Vai trò |
|---|---|
| Người bán | Chấp nhận / từ chối yêu cầu, xác nhận đã giao, hủy giao dịch |
| Người mua | Xác nhận đã nhận hàng, hủy giao dịch |
| Hệ thống | Khóa listing, tự từ chối yêu cầu còn lại, đổi trạng thái |

## 3. Use Case
| Mã | Tên | Điều kiện trước | Kết quả |
|---|---|---|---|
| UC-TXN-01 | Chấp nhận yêu cầu mua | Người gọi là chủ listing; request `PENDING`; listing `ACTIVE` | Request `ACCEPTED`, listing `IN_TRANSACTION`, sinh Transaction `IN_PROGRESS` |
| UC-TXN-02 | Từ chối yêu cầu mua | Người gọi là chủ listing; request `PENDING` | Request `REJECTED`, listing giữ nguyên |
| UC-TXN-03 | Xem lịch sử giao dịch | Đã đăng nhập | Danh sách giao dịch mà mình là buyer hoặc seller |
| UC-TXN-04 | Xác nhận giao dịch | Là buyer hoặc seller; Transaction `IN_PROGRESS` | Bật cờ của mình; đủ 2 cờ thì `COMPLETED` |
| UC-TXN-05 | Hủy giao dịch | Là buyer hoặc seller; Transaction `IN_PROGRESS` | `CANCELLED`, listing về `ACTIVE` |

(Mỗi use case thêm 1 đoạn **luồng chính** và **luồng ngoại lệ** — xem mục 5.)

## 4. Quy tắc nghiệp vụ
1. Chỉ chủ listing mới được accept/reject (`403 FORBIDDEN` nếu sai người).
2. Chỉ request `PENDING` mới được accept/reject (`409 CONFLICT` nếu khác).
3. Chỉ listing `ACTIVE` mới được khóa. Một listing chỉ nằm trong tối đa 1 giao dịch `IN_TRANSACTION`.
4. Khi accept, mọi request `PENDING` khác trên cùng listing tự động `REJECTED`.
5. Mỗi `PurchaseRequest` sinh tối đa 1 `Transaction` (`UNIQUE(purchaseRequestId)`).
6. Chỉ `COMPLETED` khi `buyerConfirmed && sellerConfirmed`.
7. `COMPLETED` → listing `SOLD`, set `completedAt`. `CANCELLED` → listing về `ACTIVE`.
8. `COMPLETED` và `CANCELLED` là trạng thái cuối.
9. Chỉ người thuộc giao dịch (buyer hoặc seller) mới được confirm/cancel.

## 5. Sơ đồ
### 5.1 State Machine — Transaction
```mermaid
stateDiagram-v2
    [*] --> IN_PROGRESS: Người bán chấp nhận yêu cầu mua
    IN_PROGRESS --> COMPLETED: buyerConfirmed và sellerConfirmed
    IN_PROGRESS --> CANCELLED: Một bên hủy
    COMPLETED --> [*]
    CANCELLED --> [*]
```

### 5.2 State Machine — Listing (phần liên quan TV6)
```mermaid
stateDiagram-v2
    ACTIVE --> IN_TRANSACTION: Accept yêu cầu mua
    IN_TRANSACTION --> SOLD: Giao dịch COMPLETED
    IN_TRANSACTION --> ACTIVE: Giao dịch CANCELLED
```

### 5.3 Activity Diagram — Chấp nhận yêu cầu mua
```mermaid
flowchart TD
    A["Người bán bấm Chấp nhận"] --> B{"Request tồn tại?"}
    B -- Không --> E1["404 NOT_FOUND"]
    B -- Có --> C{"Người bấm là chủ listing?"}
    C -- Không --> E2["403 FORBIDDEN"]
    C -- Có --> D{"Request đang PENDING?"}
    D -- Không --> E3["409 CONFLICT"]
    D -- Có --> F["Bắt đầu prisma.$transaction"]
    F --> G{"Khóa listing ACTIVE thành IN_TRANSACTION thành công?"}
    G -- Không --> E3
    G -- Có --> H["Request thành ACCEPTED"]
    H --> I["Các request PENDING khác thành REJECTED"]
    I --> J["Tạo Transaction IN_PROGRESS"]
    J --> K["Commit và trả 201"]
```

### 5.4 Activity Diagram — Xác nhận và hủy giao dịch
```mermaid
flowchart TD
    A["Người dùng bấm Xác nhận hoặc Hủy"] --> B{"Giao dịch tồn tại?"}
    B -- Không --> E1["404 NOT_FOUND"]
    B -- Có --> C{"Là buyer hoặc seller của giao dịch?"}
    C -- Không --> E2["403 FORBIDDEN"]
    C -- Có --> D{"Giao dịch đang IN_PROGRESS?"}
    D -- Không --> E3["409 CONFLICT"]
    D -- Có --> F{"Hành động?"}
    F -- Xác nhận --> G["Bật cờ của người gọi"]
    G --> H{"buyerConfirmed và sellerConfirmed?"}
    H -- Chưa đủ --> I["Giữ IN_PROGRESS và trả 200"]
    H -- Đủ --> J["COMPLETED, set completedAt, listing thành SOLD"]
    F -- Hủy --> K["CANCELLED, listing IN_TRANSACTION thành ACTIVE"]
```

## 6. Cơ chế chống Double-Booking
**Vấn đề:** hai request A và B cùng nhắm một listing, hai lần bấm accept gần như đồng thời.
**Giải pháp:** trong `prisma.$transaction`, khóa listing bằng một lệnh có điều kiện:
`updateMany({ where: { id, status: ACTIVE }, data: { status: IN_TRANSACTION } })`
rồi kiểm tra `count === 1`. Lệnh nào chạy trước thắng, lệnh sau có `count = 0` và trả `409`.
Lớp bảo vệ thứ hai: `UNIQUE(purchaseRequestId)` trên bảng Transaction.

```mermaid
sequenceDiagram
    participant S as Người bán
    participant API as API accept
    participant DB as SQLite
    S->>API: Accept request A
    S->>API: Accept request B (cùng listing)
    API->>DB: updateMany ACTIVE thành IN_TRANSACTION (A)
    DB-->>API: count = 1
    API->>DB: updateMany ACTIVE thành IN_TRANSACTION (B)
    DB-->>API: count = 0
    API-->>S: A: 201 Created
    API-->>S: B: 409 CONFLICT
```

## 7. Danh sách API
| Method | Endpoint | Mô tả | Lỗi thường gặp |
|---|---|---|---|
| POST | `/api/purchase-requests/[id]/accept` | Chấp nhận | 403, 404, 409 |
| POST | `/api/purchase-requests/[id]/reject` | Từ chối | 403, 404, 409 |
| GET | `/api/transactions` | Danh sách giao dịch | 401 |
| PATCH | `/api/transactions/[id]/confirm` | Xác nhận | 403, 404, 409 |
| PATCH | `/api/transactions/[id]/cancel` | Hủy | 403, 404, 409 |

## 8. Phụ thuộc module khác
- TV5 tạo `PurchaseRequest` (có `offeredPrice`, `0` nghĩa là giá niêm yết).
- TV7 tạo Transaction `EXCHANGE`; TV6 mở rộng confirm/cancel ở Sprint 3.
- TV3: listing `IN_TRANSACTION` không được sửa (`isListingEditable`).