import { colors } from "@/theme";

export const PDP_HORIZONTAL_PADDING = "px-4";

export const PDP_SECTION_SPACING = "mt-4";

export const PDP_SECTION_TITLE_CLASS =
  "text-[13px] font-bold uppercase tracking-wide text-pillfly-ink";

export const PDP_BODY_TEXT_CLASS = "text-[13px] leading-[20px] text-pillfly-muted";

export const PDP_SUBTITLE_CLASS = "text-[12px] leading-[18px] text-pillfly-muted";

export const PDP_ROW_PADDING = "py-3.5";

export const PDP_SURFACE_RADIUS = "rounded-xl";

export const PDP_SHEET_RADIUS = "rounded-t-2xl";

export const PDP_BORDER = "border-pillfly-line";

export const PDP_DIVIDER = "border-b border-pillfly-line";

export const PDP_CHEVRON_SIZE = 18;

export const PDP_ICON_SLOT = "h-8 w-8 items-center justify-center";

export const PDP_CAROUSEL_CARD_WIDTH = 132;

export const PDP_CAROUSEL_CARD_GAP = "gap-2.5";

export const PDP_HEADER_BODY_HEIGHT = 48;

export const PDP_HERO_IMAGE_ASPECT = 0.75;

export const PDP_HERO_IMAGE_HORIZONTAL_PADDING = 24;

export const PDP_HEADER_COLLAPSE_START = 72;

export const PDP_HEADER_COLLAPSE_END = 128;

export const PDP_SHARE_BRAND_COLORS = {
  whatsapp: "#25D366",
  facebook: "#1877F2",
  twitter: "#1DA1F2",
} as const;

export const PDP_SHEET_SHADOW = {
  shadowColor: colors.textPrimary,
  shadowOffset: { width: 0, height: -2 },
  shadowOpacity: 0.06,
  shadowRadius: 8,
  elevation: 4,
} as const;

export const PDP_FAB_SHADOW = {
  shadowColor: colors.textPrimary,
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.08,
  shadowRadius: 4,
  elevation: 2,
} as const;
