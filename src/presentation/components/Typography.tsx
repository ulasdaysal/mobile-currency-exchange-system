import React from "react";
import { Text, TextProps, StyleSheet } from "react-native";
import { theme } from "../theme/theme";

interface TypographyProps extends TextProps {
  variant?: "h1" | "h2" | "h3" | "body" | "caption" | "label";
  color?: string;
  weight?: "regular" | "medium" | "bold";
  align?: "left" | "center" | "right";
}

export const Typography: React.FC<TypographyProps> = ({
  children,
  style,
  variant = "body",
  color = theme.colors.textPrimary,
  weight,
  align = "left",
  ...props
}) => {
  const getStyle = () => {
    switch (variant) {
      case "h1":
        return styles.h1;
      case "h2":
        return styles.h2;
      case "h3":
        return styles.h3;
      case "body":
        return styles.body;
      case "caption":
        return styles.caption;
      case "label":
        return styles.label;
      default:
        return styles.body;
    }
  };

  const getWeight = () => {
    if (weight) return theme.typography.weights[weight];
    if (variant === "h1" || variant === "h2" || variant === "h3")
      return theme.typography.weights.bold;
    if (variant === "label") return theme.typography.weights.medium;
    return theme.typography.weights.regular;
  };

  return (
    <Text
      style={[
        getStyle(),
        { color, fontWeight: getWeight() as any, textAlign: align },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  h1: {
    fontSize: theme.typography.sizes.xxxl,
    lineHeight: 40,
  },
  h2: {
    fontSize: theme.typography.sizes.xxl,
    lineHeight: 32,
  },
  h3: {
    fontSize: theme.typography.sizes.xl,
    lineHeight: 28,
  },
  body: {
    fontSize: theme.typography.sizes.md,
    lineHeight: 24,
  },
  caption: {
    fontSize: theme.typography.sizes.xs,
    lineHeight: 16,
  },
  label: {
    fontSize: theme.typography.sizes.sm,
    lineHeight: 20,
  },
});
