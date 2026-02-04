import React from "react";
import {
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  StyleProp,
} from "react-native";
import { theme } from "../theme/theme";
import { Typography } from "./Typography";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  style,
  fullWidth = false,
}) => {
  const getBackgroundColor = () => {
    if (disabled) return theme.colors.surfaceHighlight;
    switch (variant) {
      case "primary":
        return theme.colors.primary;
      case "secondary":
        return theme.colors.surfaceHighlight;
      case "outline":
      case "ghost":
        return "transparent";
      default:
        return theme.colors.primary;
    }
  };

  const getBorderColor = () => {
    if (variant === "outline")
      return disabled ? theme.colors.surfaceHighlight : theme.colors.border;
    return "transparent";
  };

  const getTextColor = () => {
    if (disabled) return theme.colors.textSecondary;
    switch (variant) {
      case "primary":
        return theme.colors.textInverse;
      case "secondary":
        return theme.colors.textPrimary;
      case "outline":
        return theme.colors.textPrimary;
      case "ghost":
        return theme.colors.textSecondary;
      default:
        return theme.colors.textInverse;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={theme.typography.activeOpacity}
      style={[
        styles.container,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === "outline" ? 1 : 0,
          width: fullWidth ? "100%" : undefined,
          opacity: disabled && variant !== "primary" ? 0.5 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <Typography
          variant="label"
          weight="medium"
          color={getTextColor()}
          style={{ textAlign: "center" }}
        >
          {title}
        </Typography>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 48,
    borderRadius: theme.borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
  },
});
