import React from "react";
import { View, StyleSheet, ViewProps } from "react-native";
import { theme } from "../theme/theme";

interface CardProps extends ViewProps {
  variant?: "elevated" | "outlined" | "flat";
  padding?: "none" | "sm" | "md" | "lg";
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = "elevated",
  padding = "md",
  ...props
}) => {
  const getPadding = () => {
    if (padding === "none") return 0;
    return theme.spacing[padding];
  };

  return (
    <View
      style={[
        styles.container,
        {
          padding: getPadding(),
          backgroundColor:
            variant === "outlined" ? "transparent" : theme.colors.surface,
          borderWidth: variant === "outlined" ? 1 : 0,
          borderColor: theme.colors.border,
          ...((variant === "elevated" ? theme.shadows.sm : {}) as any),
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.lg,
  },
});
