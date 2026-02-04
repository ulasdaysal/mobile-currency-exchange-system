import React, { useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ScreenWrapper } from "../../components/ScreenWrapper";
import { Typography } from "../../components/Typography";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { theme } from "../../theme/theme";
import { useAuth } from "../../context/AuthContext";
import { AuthStackParamList } from "../../navigation/AppNavigator";

type ForgotPasswordScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  "ForgotPassword"
>;

export const ForgotPasswordScreen = () => {
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();
  const { forgotPassword, isLoading, error, clearError } = useAuth();

  const [email, setEmail] = useState("");

  const handleSendLink = async () => {
    if (!email.trim()) {
      Alert.alert("Validation Error", "Please enter your email address.");
      return;
    }

    try {
      const response = await forgotPassword(email.trim());
      // For this assignment, we might get a debug token back.
      // If response.debugToken exists, we can show it or auto-fill it for the user in the next screen.
      // But typically, we just say "Check your email".

      let message = "Check your email for the reset link.";
      if (response && response.debugToken) {
        message += `\n\n(Debug: Token is ${response.debugToken})`;
      }

      Alert.alert("Link Sent", message, [
        {
          text: "OK",
          onPress: () =>
            navigation.navigate("ResetPassword", {
              token: response?.debugToken,
            }),
        },
      ]);
    } catch {
      Alert.alert(
        "Failed",
        error || "Could not send reset link. Please try again.",
      );
    }
  };

  const handleEmailChange = (text: string) => {
    clearError();
    setEmail(text);
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
          Reset Password
        </Typography>
        <Typography
          variant="body"
          align="center"
          color={theme.colors.textSecondary}
        >
          Enter your email to receive a reset link
        </Typography>
      </View>

      <View style={styles.form}>
        <Input
          label="Email Address"
          placeholder="john@example.com"
          value={email}
          onChangeText={handleEmailChange}
          keyboardType="email-address"
          autoCapitalize="none"
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
          title="Send Reset Link"
          onPress={handleSendLink}
          loading={isLoading}
          fullWidth={true}
          style={styles.button}
          disabled={!email.trim()}
        />

        <Button
          title="Back to Login"
          onPress={() => navigation.goBack()}
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
