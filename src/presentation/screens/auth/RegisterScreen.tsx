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

type RegisterScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  "Register"
>;

export const RegisterScreen = () => {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const { register, isLoading, error, clearError } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Validation Error", "Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        "Validation Error",
        "Password must be at least 6 characters.",
      );
      return;
    }

    try {
      await register(name.trim(), email.trim(), password);
    } catch {
      Alert.alert(
        "Registration Failed",
        error || "Could not create account. Please try again.",
      );
    }
  };

  const handleInputChange =
    (setter: (value: string) => void) => (text: string) => {
      clearError();
      setter(text);
    };

  const isFormValid = name.trim() && email.trim() && password.trim();

  return (
    <ScreenWrapper style={styles.container}>
      <View style={styles.header}>
        <Typography
          variant="h1"
          align="center"
          style={styles.title}
          color={theme.colors.primary}
        >
          Create Account
        </Typography>
        <Typography
          variant="body"
          align="center"
          color={theme.colors.textSecondary}
        >
          Start trading currencies today
        </Typography>
      </View>

      <View style={styles.form}>
        <Input
          label="Full Name"
          placeholder="John Doe"
          value={name}
          onChangeText={handleInputChange(setName)}
          autoCapitalize="words"
        />
        <Input
          label="Email Address"
          placeholder="john@example.com"
          value={email}
          onChangeText={handleInputChange(setEmail)}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Input
          label="Password"
          placeholder="Create a password (min 6 chars)"
          value={password}
          onChangeText={handleInputChange(setPassword)}
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
          title="Sign Up"
          onPress={handleRegister}
          loading={isLoading}
          fullWidth={true}
          style={styles.button}
          disabled={!isFormValid}
        />
      </View>

      <View style={styles.footer}>
        <Typography variant="body" color={theme.colors.textSecondary}>
          Already have an account?{" "}
        </Typography>
        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Typography variant="body" color={theme.colors.primary} weight="bold">
            Sign In
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
  errorText: {
    marginBottom: theme.spacing.md,
    textAlign: "center",
  },
  button: {
    marginTop: theme.spacing.lg,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: theme.spacing.xl,
  },
});
