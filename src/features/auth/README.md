# Feature: Auth & Hồ sơ cá nhân — **TV1**

**Mũ 1:** PM / Scrum Master · **Mũ 2:** Module Auth

## Phạm vi
- Đăng ký tài khoản (email + mật khẩu), hash `bcryptjs` cost 10
- Đăng nhập / đăng xuất, JWT trong **httpOnly cookie**
- Middleware phân quyền `USER` / `ADMIN`
- Xem & cập nhật hồ sơ (`fullName`, `phone`, `avatarUrl`)

## API dự kiến
| Method | Route | Mô tả |
|---|---|---|
| POST | `/api/auth/register` | Đăng ký |
| POST | `/api/auth/login` | Đăng nhập → set cookie |
| POST | `/api/auth/logout` | Xoá cookie |
| GET | `/api/auth/me` | Thông tin user hiện tại |
| PATCH | `/api/profile` | Cập nhật hồ sơ |

## Model liên quan
`User` — xem `docs/diagrams/erd.md`

## File được sửa
`src/features/auth/**`, `src/app/api/auth/**`, `src/app/(auth)/**`,
`src/app/profile/**`, `src/lib/auth.ts`, `src/middleware.ts`

## Lưu ý bảo mật
- **Cấm** lưu token vào localStorage
- Không bao giờ trả `passwordHash` trong response
- Cookie: `httpOnly`, `sameSite: "lax"`, `secure: false` (localhost)
- Dùng `JWT_SECRET` từ `.env`
