/**
 * ============================================================================
 * SEED DATA - Dữ liệu mẫu cho toàn nhóm
 * ----------------------------------------------------------------------------
 * Chạy: `npm run db:seed`  (hoặc `npm run db:reset` để xoá + tạo lại từ đầu)
 *
 * Đặc điểm:
 *  - IDEMPOTENT: dùng upsert nên chạy nhiều lần không bị nhân đôi dữ liệu.
 *  - Có đủ 5 Category, 6 Brand, 1 Admin + 3 User, 10 Listing đa dạng trạng thái
 *    (ACTIVE / PENDING / HIDDEN / SOLD) và có cả tin cho phép trao đổi.
 *
 * Tài khoản demo (mật khẩu giống nhau để dễ test):
 *  - admin@nhom5.vn  / 123456   (ADMIN)
 *  - an@nhom5.vn     / 123456   (USER)
 *  - binh@nhom5.vn   / 123456   (USER)
 *  - chi@nhom5.vn    / 123456   (USER)
 *
 * ⚠️ KHÔNG dùng mật khẩu này khi triển khai thật. Đây là dữ liệu học tập.
 *
 * Chủ sở hữu: TV2 (nội dung dữ liệu) - TV8 (có thể bổ sung kịch bản Report).
 * ============================================================================
 */

import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "123456";
const PLACEHOLDER_IMAGE = "/images/placeholder-device.svg";

/* ------------------------------------------------------------------------- */
/* 1. DANH MỤC                                                               */
/* ------------------------------------------------------------------------- */
const CATEGORIES = [
  {
    slug: "dien-thoai",
    name: "Điện thoại",
    description: "Điện thoại thông minh mới và đã qua sử dụng",
    icon: "📱",
  },
  {
    slug: "laptop",
    name: "Laptop",
    description: "Laptop văn phòng, gaming, đồ hoạ",
    icon: "💻",
  },
  {
    slug: "may-tinh-bang",
    name: "Máy tính bảng",
    description: "Máy tính bảng và phụ kiện đi kèm",
    icon: "📟",
  },
  {
    slug: "tai-nghe-dong-ho",
    name: "Tai nghe & Đồng hồ",
    description: "Tai nghe, loa, đồng hồ thông minh",
    icon: "🎧",
  },
  {
    slug: "linh-kien-phu-kien",
    name: "Linh kiện & Phụ kiện",
    description: "Sạc, cáp, bàn phím, chuột và linh kiện máy tính",
    icon: "🔌",
  },
];

/* ------------------------------------------------------------------------- */
/* 2. THƯƠNG HIỆU                                                            */
/* ------------------------------------------------------------------------- */
const BRANDS = [
  { slug: "apple", name: "Apple", logoUrl: null },
  { slug: "samsung", name: "Samsung", logoUrl: null },
  { slug: "dell", name: "Dell", logoUrl: null },
  { slug: "asus", name: "Asus", logoUrl: null },
  { slug: "sony", name: "Sony", logoUrl: null },
  { slug: "xiaomi", name: "Xiaomi", logoUrl: null },
];

/* ------------------------------------------------------------------------- */
/* 3. NGƯỜI DÙNG                                                             */
/* ------------------------------------------------------------------------- */
const USERS = [
  {
    email: "admin@nhom5.vn",
    fullName: "Quản trị viên",
    phone: "0900000001",
    role: "ADMIN",
  },
  {
    email: "an@nhom5.vn",
    fullName: "Nguyễn Văn An",
    phone: "0900000002",
    role: "USER",
  },
  {
    email: "binh@nhom5.vn",
    fullName: "Trần Thị Bình",
    phone: "0900000003",
    role: "USER",
  },
  {
    email: "chi@nhom5.vn",
    fullName: "Lê Minh Chi",
    phone: "0900000004",
    role: "USER",
  },
];

/* ------------------------------------------------------------------------- */
/* 4. TIN ĐĂNG                                                               */
/*    seller: email người bán | category/brand: slug                          */
/* ------------------------------------------------------------------------- */
interface SeedListing {
  id: string;
  seller: string;
  category: string;
  brand: string | null;
  title: string;
  description: string;
  price: number;
  condition: "NEW" | "LIKE_NEW" | "GOOD" | "FAIR";
  specs: Record<string, string>;
  allowExchange: boolean;
  exchangePreference: string | null;
  status:
    | "PENDING"
    | "ACTIVE"
    | "IN_TRANSACTION"
    | "SOLD"
    | "EXCHANGED"
    | "REJECTED"
    | "HIDDEN";
}

const LISTINGS: SeedListing[] = [
  {
    id: "lst-iphone15pm",
    seller: "an@nhom5.vn",
    category: "dien-thoai",
    brand: "apple",
    title: "iPhone 15 Pro Max 256GB - Titan tự nhiên",
    description:
      "Máy mua chính hãng VN/A tháng 12/2024, pin 98%, không trầy xước, đầy đủ hộp và cáp.",
    price: 25900000,
    condition: "LIKE_NEW",
    specs: {
      screen: "6.7 inch Super Retina XDR",
      chip: "Apple A17 Pro",
      storage: "256GB",
      battery: "98%",
    },
    allowExchange: true,
    exchangePreference: "Muốn đổi sang MacBook Air M2/M3, bù tiền hợp lý",
    status: "ACTIVE",
  },
  {
    id: "lst-s24ultra",
    seller: "binh@nhom5.vn",
    category: "dien-thoai",
    brand: "samsung",
    title: "Samsung Galaxy S24 Ultra 512GB",
    description:
      "Máy Hàn Quốc, còn bảo hành 8 tháng, kèm bút S-Pen và ốp lưng chính hãng.",
    price: 21500000,
    condition: "LIKE_NEW",
    specs: {
      screen: "6.8 inch Dynamic AMOLED 2X",
      chip: "Snapdragon 8 Gen 3",
      storage: "512GB",
      battery: "5000 mAh",
    },
    allowExchange: false,
    exchangePreference: null,
    status: "ACTIVE",
  },
  {
    id: "lst-xiaomi14",
    seller: "chi@nhom5.vn",
    category: "dien-thoai",
    brand: "xiaomi",
    title: "Xiaomi 14 5G 256GB - Đen",
    description:
      "Máy trầy nhẹ viền, màn hình đẹp, pin tốt. Bán kèm sạc 90W.",
    price: 12900000,
    condition: "GOOD",
    specs: {
      screen: "6.36 inch AMOLED",
      chip: "Snapdragon 8 Gen 3",
      storage: "256GB",
      battery: "4610 mAh",
    },
    allowExchange: true,
    exchangePreference: "Đổi sang iPhone 13/14, bù tiền thương lượng",
    status: "ACTIVE",
  },
  {
    id: "lst-mba-m3",
    seller: "an@nhom5.vn",
    category: "laptop",
    brand: "apple",
    title: 'MacBook Air M3 13" 16GB/512GB',
    description:
      "Máy mua 3/2024, còn bảo hành Apple đến 3/2026, sạc zin, pin 100%.",
    price: 28500000,
    condition: "LIKE_NEW",
    specs: {
      cpu: "Apple M3 8-core",
      ram: "16GB",
      storage: "512GB SSD",
      screen: '13.6" Liquid Retina',
    },
    allowExchange: true,
    exchangePreference: "Đổi sang MacBook Pro 14 M3 Pro, mình bù tiền",
    status: "ACTIVE",
  },
  {
    id: "lst-dell-xps13",
    seller: "binh@nhom5.vn",
    category: "laptop",
    brand: "dell",
    title: "Dell XPS 13 9340 - i7/16GB/512GB",
    description:
      "Laptop mỏng nhẹ, đã dùng 1 năm, bàn phím tốt, máy không lỗi.",
    price: 24900000,
    condition: "GOOD",
    specs: {
      cpu: "Intel Core i7-1360P",
      ram: "16GB LPDDR5",
      storage: "512GB SSD",
      screen: '13.4" FHD+',
    },
    allowExchange: false,
    exchangePreference: null,
    status: "ACTIVE",
  },
  {
    id: "lst-rog-g14",
    seller: "chi@nhom5.vn",
    category: "laptop",
    brand: "asus",
    title: "Asus ROG Zephyrus G14 RTX 4060",
    description:
      "Laptop gaming gọn nhẹ, màn 165Hz, máy còn 6 tháng bảo hành, tặng kèm balo.",
    price: 32000000,
    condition: "LIKE_NEW",
    specs: {
      cpu: "AMD Ryzen 9 8945HS",
      gpu: "NVIDIA RTX 4060 8GB",
      ram: "16GB DDR5",
      storage: "1TB SSD",
    },
    allowExchange: true,
    exchangePreference: "Đổi sang MacBook Pro để làm đồ hoạ",
    status: "ACTIVE",
  },
  {
    id: "lst-ipad-pro-m2",
    seller: "an@nhom5.vn",
    category: "may-tinh-bang",
    brand: "apple",
    title: 'iPad Pro 11" M2 256GB WiFi',
    description:
      "Máy còn bảo hành, kèm Apple Pencil 2 và case chính hãng.",
    price: 18900000,
    condition: "GOOD",
    specs: {
      screen: '11" Liquid Retina',
      chip: "Apple M2",
      storage: "256GB",
      connectivity: "WiFi",
    },
    allowExchange: true,
    exchangePreference: "Đổi sang iPad Air 13 hoặc máy tính bảng Android cao cấp",
    status: "ACTIVE",
  },
  {
    id: "lst-tab-s9",
    seller: "binh@nhom5.vn",
    category: "may-tinh-bang",
    brand: "samsung",
    title: "Samsung Galaxy Tab S9 11 inch",
    description:
      "Máy đã dùng 8 tháng, kèm bàn phím rời và bút S-Pen. Màn hình đẹp.",
    price: 15500000,
    condition: "GOOD",
    specs: {
      screen: '11" Dynamic AMOLED 2X',
      chip: "Snapdragon 8 Gen 2",
      storage: "128GB",
      battery: "8400 mAh",
    },
    allowExchange: false,
    exchangePreference: null,
    status: "PENDING",
  },
  {
    id: "lst-sony-xm5",
    seller: "chi@nhom5.vn",
    category: "tai-nghe-dong-ho",
    brand: "sony",
    title: "Tai nghe Sony WH-1000XM5",
    description:
      "Tai nghe chống ồn tốt nhất tầm giá, còn hộp, đã vệ sinh sạch sẽ.",
    price: 6200000,
    condition: "LIKE_NEW",
    specs: {
      type: "Over-ear",
      battery: "30 giờ",
      connectivity: "Bluetooth 5.2",
      anc: "Có",
    },
    allowExchange: true,
    exchangePreference: "Đổi sang AirPods Pro 2 hoặc đồng hồ thông minh",
    status: "ACTIVE",
  },
  {
    id: "lst-watch-s9",
    seller: "an@nhom5.vn",
    category: "tai-nghe-dong-ho",
    brand: "apple",
    title: "Apple Watch Series 9 45mm GPS",
    description:
      "Đồng hồ mới 99%, còn bảo hành đến 2026, dây thể thao zin.",
    price: 8900000,
    condition: "NEW",
    specs: {
      size: "45mm",
      connectivity: "GPS",
      battery: "95%",
      strap: "Sport Band",
    },
    allowExchange: false,
    exchangePreference: null,
    status: "SOLD",
  },
  {
    id: "lst-sac-anker",
    seller: "binh@nhom5.vn",
    category: "linh-kien-phu-kien",
    brand: null,
    title: "Sạc Anker 65W GaN + cáp USB-C 2m",
    description: "Bộ sạc nhanh chính hãng, dùng tốt cho laptop và điện thoại.",
    price: 450000,
    condition: "NEW",
    specs: {
      power: "65W",
      ports: "2C + 1A",
      cable: "USB-C to USB-C 2m",
    },
    allowExchange: false,
    exchangePreference: null,
    status: "ACTIVE",
  },
];

/* ------------------------------------------------------------------------- */
/* MAIN                                                                      */
/* ------------------------------------------------------------------------- */
async function main() {
  console.log("🌱 Bắt đầu seed dữ liệu...");

  // --- Categories ---
  const categoryIdBySlug = new Map<string, string>();
  for (const category of CATEGORIES) {
    const record = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        description: category.description,
        icon: category.icon,
      },
      create: category,
    });
    categoryIdBySlug.set(category.slug, record.id);
  }
  console.log(`   ✓ ${CATEGORIES.length} danh mục`);

  // --- Brands ---
  const brandIdBySlug = new Map<string, string>();
  for (const brand of BRANDS) {
    const record = await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: { name: brand.name, logoUrl: brand.logoUrl },
      create: brand,
    });
    brandIdBySlug.set(brand.slug, record.id);
  }
  console.log(`   ✓ ${BRANDS.length} thương hiệu`);

  // --- Users ---
  const passwordHash = await hash(DEMO_PASSWORD, 10);
  const userIdByEmail = new Map<string, string>();
  for (const user of USERS) {
    const record = await prisma.user.upsert({
      where: { email: user.email },
      update: {
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        status: "ACTIVE",
      },
      create: {
        email: user.email,
        passwordHash,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        status: "ACTIVE",
      },
    });
    userIdByEmail.set(user.email, record.id);
  }
  console.log(`   ✓ ${USERS.length} người dùng (mật khẩu: ${DEMO_PASSWORD})`);

  // --- Listings ---
  for (const listing of LISTINGS) {
    const sellerId = userIdByEmail.get(listing.seller);
    const categoryId = categoryIdBySlug.get(listing.category);
    const brandId = listing.brand ? brandIdBySlug.get(listing.brand) : null;

    if (!sellerId || !categoryId) {
      throw new Error(`Seed lỗi: thiếu dữ liệu tham chiếu cho ${listing.id}`);
    }

    const data = {
      sellerId,
      categoryId,
      brandId: brandId ?? null,
      title: listing.title,
      description: listing.description,
      price: listing.price,
      condition: listing.condition,
      specsJson: JSON.stringify(listing.specs),
      imagesJson: JSON.stringify([PLACEHOLDER_IMAGE]),
      allowExchange: listing.allowExchange,
      exchangePreference: listing.exchangePreference,
      status: listing.status,
    };

    await prisma.listing.upsert({
      where: { id: listing.id },
      update: data,
      create: { id: listing.id, ...data },
    });
  }
  console.log(`   ✓ ${LISTINGS.length} tin đăng`);

  const counts = {
    users: await prisma.user.count(),
    categories: await prisma.category.count(),
    brands: await prisma.brand.count(),
    listings: await prisma.listing.count(),
  };
  console.log("✅ Seed hoàn tất:", counts);
}

main()
  .catch((error) => {
    console.error("❌ Seed thất bại:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
