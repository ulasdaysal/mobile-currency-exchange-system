import React from "react";
import { StatusBar, StyleSheet, View, ViewProps, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../theme/theme";

interface ScreenWrapperProps extends ViewProps {
  children: React.ReactNode;
  bg?: string;
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  style,
  bg = theme.colors.background,
  ...props
}) => {
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: bg }]}
      edges={["top", "left", "right"]}
    >
      <StatusBar barStyle="light-content" backgroundColor={bg} />
      <View style={[styles.content, style]} {...props}>
        {children}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
    paddingTop: Platform.OS === "android" ? theme.spacing.xl : theme.spacing.md,
    // Web Layout Constraints
    ...(Platform.OS === "web"
      ? {
          maxWidth: 500,
          width: "100%",
          alignSelf: "center",
          paddingTop: theme.spacing.lg,
        }
      : {}),
  },
});
