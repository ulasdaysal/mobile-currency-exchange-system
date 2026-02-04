import React, { useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ScreenWrapper } from "../../components/ScreenWrapper";
import { Typography } from "../../components/Typography";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { theme } from "../../theme/theme";
import { useAuth } from "../../context/AuthContext";
import { AuthStackParamList } from "../../navigation/AppNavigator";

type ResetPasswordScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  "ResetPassword"
>;

type ResetPasswordScreenRouteProp = RouteProp<
  AuthStackParamList,
  "ResetPassword"
>;

export const ResetPasswordScreen = () => {
  const navigation = useNavigation<ResetPasswordScreenNavigationProp>();
  const route = useRoute<ResetPasswordScreenRouteProp>();
  const { resetPassword, isLoading, error, clearError } = useAuth();

  // Pre-fill token if passed from previous screen (debug/convenience)
  const [token, setToken] = useState(route.params?.token || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleReset = async () => {
    if (!token.trim() || !newPassword.trim()) {
      Alert.alert("Validation Error", "Please enter token and new password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Validation Error", "Passwords do not match.");
      return;
    }

    try {
      await resetPassword(token.trim(), newPassword);
      Alert.alert(
        "Success",
        "Your password has been reset. Please login with your new password.",
        [
          {
            text: "OK",
            onPress: () => navigation.navigate("Login"),
          },
        ],
      );
    } catch {
      Alert.alert(
        "Reset Failed",
        error ||
          "Could not reset password. Please check your token and try again.",
      );
    }
  };

  const handleTokenChange = (text: string) => {
    clearError();
    setToken(text);
  };

  return (
    <ScreenWrapper style={styles.container}>
      <View style={styles.header}>
        <Typography
          variant="h2"
          align="center"
          style={styles.title}
          color={theme.colors.primary}
        >
          New Password
        </Typography>
        <Typography
          variant="body"
          align="center"
          color={theme.colors.textSecondary}
        >
          Enter the code from your email and your new password
        </Typography>
      </View>

      <View style={styles.form}>
        <Input
          label="Reset Token"
          placeholder="Enter reset code"
          value={token}
          onChangeText={handleTokenChange}
          autoCapitalize="none"
        />

        <Input
          label="New Password"
          placeholder="Enter new password"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry={true}
        />

        <Input
          label="Confirm Password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={true}
        />

        {error && (
          <Typography
            variant="caption"
            color={theme.colors.error}
            style={styles.errorText}
          >
            {error}
          </Typography>
        )}

        <Button
          title="Reset Password"
          onPress={handleReset}
          loading={isLoading}
          fullWidth={true}
          style={styles.button}
          disabled={
            !token.trim() || !newPassword.trim() || !confirmPassword.trim()
          }
        />

        <Button
          title="Back to Login"
          onPress={() => navigation.navigate("Login")}
          variant="ghost"
          fullWidth={true}
          style={styles.backButton}
        />
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    paddingHorizontal: theme.spacing.lg,
  },
  header: {
    marginBottom: theme.spacing.xxl,
    alignItems: "center",
  },
  title: {
    marginBottom: theme.spacing.sm,
  },
  form: {
    width: "100%",
  },
  errorText: {
    marginBottom: theme.spacing.md,
    textAlign: "center",
  },
  button: {
    marginTop: theme.spacing.lg,
  },
  backButton: {
    marginTop: theme.spacing.sm,
  },
});
