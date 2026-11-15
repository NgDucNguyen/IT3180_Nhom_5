import { SHOP_BANNER_THEMES, type ShopBannerTheme } from "@/lib/constants";

export interface ShopThemeStyle {
  label: string;
  gradientClass: string;
  badgeClass: string;
  swatchClass: string;
}

export const SHOP_THEME_MAP: Record<ShopBannerTheme, ShopThemeStyle> = {
  [SHOP_BANNER_THEMES.INDIGO]: {
    label: "Chàm Công Nghệ (Indigo)",
    gradientClass: "from-slate-900 via-indigo-950 to-indigo-800",
    badgeClass: "bg-indigo-500 text-white",
    swatchClass: "bg-indigo-600",
  },
  [SHOP_BANNER_THEMES.EMERALD]: {
    label: "Xanh Ngọc Lục Bảo",
    gradientClass: "from-slate-900 via-emerald-950 to-teal-800",
    badgeClass: "bg-emerald-500 text-white",
    swatchClass: "bg-emerald-600",
  },
  [SHOP_BANNER_THEMES.AMBER]: {
    label: "Vàng Hổ Phách Nổi Bật",
    gradientClass: "from-stone-900 via-amber-950 to-orange-800",
    badgeClass: "bg-amber-500 text-slate-950",
    swatchClass: "bg-amber-500",
  },
  [SHOP_BANNER_THEMES.ROSE]: {
    label: "Đỏ Đô Gaming",
    gradientClass: "from-slate-950 via-rose-950 to-rose-800",
    badgeClass: "bg-rose-500 text-white",
    swatchClass: "bg-rose-600",
  },
  [SHOP_BANNER_THEMES.SLATE]: {
    label: "Đen Tối Giản (Pro)",
    gradientClass: "from-slate-950 via-slate-900 to-slate-800",
    badgeClass: "bg-slate-600 text-white",
    swatchClass: "bg-slate-800",
  },
};

export function getShopThemeStyle(theme?: string | null): ShopThemeStyle {
  if (theme && theme in SHOP_THEME_MAP) {
    return SHOP_THEME_MAP[theme as ShopBannerTheme];
  }
  return SHOP_THEME_MAP[SHOP_BANNER_THEMES.INDIGO];
}
