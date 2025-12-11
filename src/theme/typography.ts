import { Platform } from "react-native";

export const TYPOGRAPHY = {
  fontWeights: {
    thin: "100",
    extralight: "200",
    light: "300",
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extrabold: "800",
    black: "900",
  } as const,

  fontSizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    "2xl": 24,
    "3xl": 28,
    "4xl": 32,
    "5xl": 36,
    "6xl": 40,
  } as const,

  lineHeights: {
    tight: 1.2,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  } as const,

  letterSpacing: {
    tighter: -0.5,
    tight: -0.25,
    normal: 0,
    wide: 0.25,
    wider: 0.5,
    widest: 1,
  } as const,

  styles: {
    h1: {
      fontSize: 40,
      fontWeight: "700" as const,
      lineHeight: 48,
      letterSpacing: -0.5,
    },
    h2: {
      fontSize: 36,
      fontWeight: "700" as const,
      lineHeight: 44,
      letterSpacing: -0.25,
    },
    h3: {
      fontSize: 32,
      fontWeight: "700" as const,
      lineHeight: 40,
      letterSpacing: 0,
    },
    h4: {
      fontSize: 28,
      fontWeight: "700" as const,
      lineHeight: 36,
      letterSpacing: 0,
    },
    h5: {
      fontSize: 24,
      fontWeight: "700" as const,
      lineHeight: 32,
      letterSpacing: 0,
    },
    h6: {
      fontSize: 20,
      fontWeight: "700" as const,
      lineHeight: 28,
      letterSpacing: 0,
    },

    displayLarge: {
      fontSize: 32,
      fontWeight: "600" as const,
      lineHeight: 40,
    },
    displayMedium: {
      fontSize: 28,
      fontWeight: "600" as const,
      lineHeight: 36,
    },
    displaySmall: {
      fontSize: 24,
      fontWeight: "600" as const,
      lineHeight: 32,
    },

    bodyLarge: {
      fontSize: 18,
      fontWeight: "400" as const,
      lineHeight: 28,
    },
    bodyMedium: {
      fontSize: 16,
      fontWeight: "400" as const,
      lineHeight: 24,
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: "400" as const,
      lineHeight: 20,
    },

    labelLarge: {
      fontSize: 16,
      fontWeight: "600" as const,
      lineHeight: 24,
    },
    labelMedium: {
      fontSize: 14,
      fontWeight: "600" as const,
      lineHeight: 20,
    },
    labelSmall: {
      fontSize: 12,
      fontWeight: "600" as const,
      lineHeight: 16,
    },

    captionLarge: {
      fontSize: 14,
      fontWeight: "500" as const,
      lineHeight: 20,
    },
    captionSmall: {
      fontSize: 12,
      fontWeight: "500" as const,
      lineHeight: 16,
    },

    buttonLarge: {
      fontSize: 16,
      fontWeight: "600" as const,
      lineHeight: 24,
    },
    buttonMedium: {
      fontSize: 14,
      fontWeight: "600" as const,
      lineHeight: 20,
    },
    buttonSmall: {
      fontSize: 12,
      fontWeight: "600" as const,
      lineHeight: 16,
    },
  },
};
