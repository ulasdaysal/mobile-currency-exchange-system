import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ScreenWrapper } from "../../components/ScreenWrapper";
import { Typography } from "../../components/Typography";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { theme } from "../../theme/theme";
import { useAuth } from "../../context/AuthContext";
import { AuthStackParamList } from "../../navigation/AppNavigator";

type LoginScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  "Login"
>;

export const LoginScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { login, isLoading, error, clearError } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Validation Error", "Please enter both email and password.");
      return;
    }

    try {
      await login(email.trim(), password);
    } catch {
      Alert.alert(
        "Login Failed",
        error || "Invalid credentials. Please try again.",
      );
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate("ForgotPassword");
  };

  const handleEmailChange = (text: string) => {
    clearError();
    setEmail(text);
  };

  const handlePasswordChange = (text: string) => {
    clearError();
    setPassword(text);
  };

  return (
    <ScreenWrapper style={styles.container}>
      <View style={styles.header}>
        <Typography
          variant="h1"
          align="center"
          style={styles.title}
          color={theme.colors.primary}
        >
          MobileCurrency
        </Typography>
        <Typography
          variant="body"
          align="center"
          color={theme.colors.textSecondary}
        >
          Sign in to access your wallet
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
        <Input
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={handlePasswordChange}
          secureTextEntry={true}
        />

        <TouchableOpacity
          style={styles.forgotPassword}
          onPress={handleForgotPassword}
        >
          <Typography variant="caption" color={theme.colors.primary}>
            Forgot Password?
          </Typography>
        </TouchableOpacity>

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
          title="Sign In"
          onPress={handleLogin}
          loading={isLoading}
          fullWidth={true}
          style={styles.button}
          disabled={!email.trim() || !password.trim()}
        />
      </View>

      <View style={styles.footer}>
        <Typography variant="body" color={theme.colors.textSecondary}>
          Don't have an account?{" "}
        </Typography>
        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
          <Typography variant="body" color={theme.colors.primary} weight="bold">
            Sign Up
          </Typography>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
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
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: theme.spacing.md,
  },
  errorText: {
    marginBottom: theme.spacing.md,
    textAlign: "center",
  },
  button: {
    marginTop: theme.spacing.sm,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: theme.spacing.xl,
  },
});
