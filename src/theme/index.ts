// Central Theme Export - Import all theme files from here
export * from "./colors";
export * from "./typography";
export * from "./spacing";
export * from "./styles";

import { COLORS } from "./colors";
import { TYPOGRAPHY } from "./typography";
import { SPACING } from "./spacing";
import { HEADER_STYLES, ICON_SIZES, SHADOWS } from "./styles";

// Combined theme object for easy access
export const THEME = {
  colors: COLORS,
  typography: TYPOGRAPHY,
  spacing: SPACING,
  headerStyles: HEADER_STYLES,
  iconSizes: ICON_SIZES,
  shadows: SHADOWS,
};

export default THEME;
