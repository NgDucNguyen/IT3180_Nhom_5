// Kiểm thử trình duyệt tùy chọn; dùng driver có sẵn bên ngoài dependencies dự án.
// Chạy bằng: node --import tsx src/features/listing/browser-check.mjs
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { prisma } from "../../lib/prisma.ts";
import { CONDITION, LISTING_STATUS } from "../../lib/constants.ts";

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright-core");
const base = process.env.LISTING_BASE_URL || "http://127.0.0.1:3180";
const evidence = resolve(process.env.LISTING_EVIDENCE_DIR || "src/features/listing/evidence");
mkdirSync(evidence, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH,
  headless: true,
});
const context = await browser.newContext({ viewport: { width: 1280, height: 960 } });
const page = await context.newPage();
const errors = [];
let userId;
page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (message) => {
  if (/hydration|hydrated/i.test(message.text())) errors.push(message.text());
});

async function noOverflow() {
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), "Trang không tràn ngang");
}

async function getMine() {
  const response = await context.request.get(`${base}/api/listings?mine=true`);
  assert.equal(response.status(), 200);
  return (await response.json()).data;
}

try {
  for (const path of ["/listings/create", "/seller/listings", "/my-listings"]) {
    await page.goto(base + path);
    await page.waitForURL(base + "/login");
  }
  const registered = await context.request.post(base + "/api/auth/register", {
    data: { email: `tv3-browser-${randomUUID()}@example.test`, password: "BrowserListing123!", fullName: "Người bán kiểm thử TV3" },
  });
  assert.equal(registered.status(), 201);
  userId = (await registered.json()).data.id;
  await page.goto(base + "/seller/listings");
  await page.getByRole("heading", { name: "Chưa có tin đăng", exact: true }).waitFor();
  await page.getByRole("link", { name: "Đăng tin đầu tiên", exact: true }).click();
  await page.getByRole("heading", { name: "Đăng tin thiết bị", exact: true }).waitFor();
  await page.getByLabel("Danh mục", { exact: false }).selectOption({ label: "Laptop" });
  await page.getByLabel("Thương hiệu", { exact: true }).selectOption({ label: "Dell" });
  await page.getByLabel("Tiêu đề tin đăng", { exact: false }).fill("Laptop Dell kiểm thử TV3");
  await page.getByLabel("Giá bán (VNĐ)", { exact: false }).fill("0");
  await page.getByLabel("Mô tả thiết bị", { exact: false }).fill("Máy chạy tốt, đầy đủ phụ kiện, màn hình không trầy xước.");
  await page.getByLabel("CPU / Vi xử lý", { exact: true }).fill("Intel Core i5");
  await page.getByLabel("RAM", { exact: true }).fill("16 GB");
  await page.getByLabel("Bộ nhớ / Lưu trữ", { exact: true }).fill("512 GB SSD");
  await page.getByLabel("Đường dẫn hình ảnh", { exact: true }).fill("/images/placeholder-device.svg");
  await page.getByRole("checkbox").check();
  await page.getByLabel("Thiết bị mong muốn trao đổi", { exact: true }).fill("Muốn đổi máy tính bảng");
  let creates = 0;
  page.on("request", (request) => {
    if (request.method() === "POST" && new URL(request.url()).pathname === "/api/listings") creates++;
  });
  await page.getByRole("button", { name: "Gửi tin chờ duyệt", exact: true }).click();
  assert.equal(creates, 0, "Giá bằng 0 bị chặn trước khi gửi API");
  assert.equal(await page.getByLabel("Giá bán (VNĐ)", { exact: false }).evaluate((element) => element.validity.valid), false);
  await page.getByLabel("Giá bán (VNĐ)", { exact: false }).fill("8500000");
  await noOverflow();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: resolve(evidence, "create-desktop.png"), fullPage: true, caret: "initial" });

  await page.route("**/api/listings", (route) => route.fulfill({
    status: 503, contentType: "application/json",
    body: JSON.stringify({ error: { code: "INTERNAL_ERROR", message: "Lỗi kết nối kiểm thử. Vui lòng thử lại." } }),
  }));
  await page.getByRole("button", { name: "Gửi tin chờ duyệt", exact: true }).click();
  await page.getByRole("alert").filter({ hasText: "Lỗi kết nối kiểm thử" }).waitFor();
  assert.equal(await page.getByLabel("Tiêu đề tin đăng", { exact: false }).inputValue(), "Laptop Dell kiểm thử TV3");
  await page.unroute("**/api/listings");
  await page.getByRole("button", { name: "Gửi tin chờ duyệt", exact: true }).click();
  await page.waitForURL(base + "/seller/listings?created=1");
  let mine = await getMine();
  assert.equal(mine.total, 1);
  const id = mine.items[0].id;
  assert.equal(mine.items[0].status, LISTING_STATUS.PENDING);
  assert.equal(mine.items[0].sellerId, userId);
  assert.equal(mine.items[0].condition, CONDITION.GOOD);
  assert.equal(mine.items[0].allowExchange, true);
  assert.ok(!JSON.stringify(mine).includes("passwordHash"));
  await page.getByRole("button", { name: "Sửa tin", exact: true }).click();
  let dialog = page.getByRole("dialog");
  assert.equal(await dialog.getByLabel("RAM", { exact: true }).inputValue(), "16 GB");
  await dialog.getByLabel("Giá bán (VNĐ)", { exact: false }).fill("9000000");
  await dialog.getByRole("checkbox").uncheck();
  await dialog.getByRole("button", { name: "Lưu thay đổi", exact: true }).click();
  await dialog.waitFor({ state: "hidden" });
  mine = await getMine();
  assert.equal(mine.items[0].price, 9000000);
  assert.equal(mine.items[0].allowExchange, false);
  assert.equal(mine.items[0].exchangePreference, null);

  // TV8 chưa có API duyệt: thay đổi này chỉ tạo fixture cho kiểm thử UI TV3.
  await prisma.listing.update({ where: { id }, data: { status: LISTING_STATUS.ACTIVE }, select: { id: true } });
  await page.reload();
  await page.getByRole("button", { name: "Ẩn tin", exact: true }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Ẩn tin", exact: true }).click();
  await page.getByRole("dialog").waitFor({ state: "hidden" });
  assert.equal((await getMine()).items[0].status, LISTING_STATUS.HIDDEN);
  await page.getByRole("button", { name: "Bỏ ẩn", exact: true }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Bỏ ẩn tin", exact: true }).click();
  await page.getByRole("dialog").waitFor({ state: "hidden" });
  assert.equal((await getMine()).items[0].status, LISTING_STATUS.ACTIVE);
  await page.getByRole("button", { name: "Ẩn tin", exact: true }).waitFor();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: resolve(evidence, "seller-desktop.png"), fullPage: true, caret: "initial" });

  await page.getByRole("button", { name: "Sửa tin", exact: true }).click();
  dialog = page.getByRole("dialog");
  await dialog.getByLabel("Danh mục", { exact: false }).selectOption({ label: "Laptop" });
  await dialog.getByRole("button", { name: "Lưu thay đổi", exact: true }).click();
  await dialog.waitFor({ state: "hidden" });
  assert.equal((await getMine()).items[0].status, LISTING_STATUS.ACTIVE, "Lưu form không đổi nội dung giữ ACTIVE");

  await page.getByRole("button", { name: "Sửa tin", exact: true }).click();
  dialog = page.getByRole("dialog");
  await dialog.getByText("Thay đổi nội dung tin đang bán sẽ gửi tin về chờ duyệt lại.", { exact: true }).waitFor();
  await dialog.getByLabel("Tiêu đề tin đăng", { exact: false }).fill("Laptop Dell đã cập nhật TV3");
  await dialog.getByRole("button", { name: "Lưu thay đổi", exact: true }).click();
  await dialog.waitFor({ state: "hidden" });
  assert.equal((await getMine()).items[0].status, LISTING_STATUS.PENDING);
  await page.getByRole("link", { name: "Chờ duyệt", exact: true }).click();
  await page.waitForURL(`${base}/seller/listings?status=${LISTING_STATUS.PENDING}`);
  await page.getByRole("heading", { name: "Laptop Dell đã cập nhật TV3", exact: true }).waitFor();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base + "/my-listings");
  await page.getByRole("heading", { name: "Tin đăng của tôi", exact: true }).waitFor();
  await noOverflow();
  await page.screenshot({ path: resolve(evidence, "seller-mobile.png"), fullPage: true, caret: "initial" });
  await page.getByRole("button", { name: "Sửa tin", exact: true }).click();
  await page.getByRole("dialog").waitFor();
  await noOverflow();
  await page.getByRole("button", { name: "Đóng hộp thoại", exact: true }).click();
  await page.goto(base + "/listings/create");
  await page.getByLabel("Danh mục", { exact: false }).selectOption({ label: "Laptop" });
  await noOverflow();
  await page.screenshot({ path: resolve(evidence, "create-mobile.png"), fullPage: true, caret: "initial" });
  assert.deepEqual(errors, [], "Không có lỗi JavaScript hoặc hydration");
  process.stdout.write("PASS TV3: auth guards, empty state, form validation, error recovery, create/edit, visibility, review, filters, alias, desktop/mobile and screenshots.\n");
} finally {
  await context.close();
  await browser.close();
  if (userId) {
    await prisma.listing.deleteMany({ where: { sellerId: userId } });
    await prisma.user.delete({ where: { id: userId }, select: { id: true } });
  }
  await prisma.$disconnect();
}
