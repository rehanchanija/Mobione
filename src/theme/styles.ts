import { Platform } from "react-native";
import { COLORS } from "./colors";
import { TYPOGRAPHY } from "./typography";
import { SPACING } from "./spacing";

export const HEADER_STYLES = {
  tabHeader: {
    headerStyle: {
      backgroundColor: COLORS.white,
      height: 110,
      paddingTop: Platform.OS === "android" ? 20 : 25,
      paddingBottom: SPACING.lg,
      paddingHorizontal: SPACING.xl,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.border,
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    headerTitleStyle: {
      fontSize: TYPOGRAPHY.fontSizes["2xl"],
      fontWeight: "700",
      color: COLORS.textPrimary,
    },
    headerTintColor: COLORS.textPrimary,
    headerStatusBarHeight: 0,
  },

  stackHeader: {
    headerStyle: {
      backgroundColor: COLORS.white,
      height: 65,
      paddingTop: Platform.OS === "android" ? 12 : 10,
      paddingBottom: SPACING.md,
      paddingHorizontal: SPACING.lg,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.border,
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 2,
      elevation: 1,
    },
    headerTitleStyle: {
      fontSize: TYPOGRAPHY.fontSizes.xl,
      fontWeight: "600",
      color: COLORS.textPrimary,
    },
    headerTintColor: COLORS.textPrimary,
    headerBackTitleVisible: true,
    headerStatusBarHeight: 0,
  },

  modalHeader: {
    headerStyle: {
      backgroundColor: COLORS.white,
      height: 70,
      paddingTop: Platform.OS === "android" ? 15 : 12,
      paddingBottom: SPACING.md,
      paddingHorizontal: SPACING.lg,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.border,
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 2,
      elevation: 1,
    },
    headerTitleStyle: {
      fontSize: TYPOGRAPHY.fontSizes.lg,
      fontWeight: "600",
      color: COLORS.textPrimary,
    },
    headerTintColor: COLORS.textPrimary,
    headerStatusBarHeight: 0,
  },

  notificationHeader: {
    headerStyle: {
      backgroundColor: COLORS.white,
      height: 70,
      paddingTop: Platform.OS === "android" ? 15 : 12,
      paddingBottom: SPACING.md,
      paddingHorizontal: SPACING.lg,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.border,
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 2,
      elevation: 1,
    },
    headerTitleStyle: {
      fontSize: TYPOGRAPHY.fontSizes.xl,
      fontWeight: "600",
      color: COLORS.textPrimary,
    },
    headerTintColor: COLORS.textPrimary,
    headerStatusBarHeight: 0,
  },

  profileHeader: {
    headerStyle: {
      backgroundColor: COLORS.white,
      height: 70,
      paddingTop: Platform.OS === "android" ? 15 : 12,
      paddingBottom: SPACING.md,
      paddingHorizontal: SPACING.lg,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.border,
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 2,
      elevation: 1,
    },
    headerTitleStyle: {
      fontSize: TYPOGRAPHY.fontSizes.xl,
      fontWeight: "600",
      color: COLORS.textPrimary,
    },
    headerTintColor: COLORS.textPrimary,
    headerStatusBarHeight: 0,
  },

  detailHeader: {
    headerStyle: {
      backgroundColor: COLORS.white,
      height: 65,
      paddingTop: Platform.OS === "android" ? 12 : 10,
      paddingBottom: SPACING.md,
      paddingHorizontal: SPACING.lg,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.border,
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 2,
      elevation: 1,
    },
    headerTitleStyle: {
      fontSize: TYPOGRAPHY.fontSizes.base,
      fontWeight: "600",
      color: COLORS.textPrimary,
    },
    headerTintColor: COLORS.textPrimary,
    headerBackTitleVisible: false,
    headerStatusBarHeight: 0,
  },
};

export const ICON_SIZES = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 40,
  "2xl": 48,
  "3xl": 56,
};

export const SHADOWS = {
  none: {
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  lg: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  xl: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
};
