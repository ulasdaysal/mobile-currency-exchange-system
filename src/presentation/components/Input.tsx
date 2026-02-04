import React, { useState } from "react";
import {
  View,
  TextInput,
  TextInputProps,
  StyleSheet,
  Text,
} from "react-native";
import { theme } from "../theme/theme";
import { Typography } from "./Typography";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  style,
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus && onFocus(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur && onBlur(e);
  };

  return (
    <View style={styles.container}>
      {label && (
        <Typography
          variant="caption"
          color={theme.colors.textSecondary}
          style={styles.label}
        >
          {label}
        </Typography>
      )}
      <TextInput
        style={[
          styles.input,
          {
            borderColor: error
              ? theme.colors.error
              : isFocused
                ? theme.colors.borderFocus
                : theme.colors.border,
          },
          style,
        ]}
        placeholderTextColor={theme.colors.textTertiary}
        onFocus={handleFocus}
        onBlur={handleBlur}
        selectionColor={theme.colors.primary}
        {...props}
      />
      {error && (
        <Typography
          variant="caption"
          color={theme.colors.error}
          style={styles.error}
        >
          {error}
        </Typography>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    marginBottom: theme.spacing.xs,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sizes.md,
  },
  error: {
    marginTop: theme.spacing.xs,
  },
});
