import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { theme } from "../theme/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Typography } from "../components/Typography";
import {
  LucideIcon,
  TrendingUp,
  Wallet,
  History,
  LogIn,
  ArrowRightLeft,
  Home,
} from "lucide-react-native";

// Screens
import { LoginScreen } from "../screens/auth/LoginScreen";
import { RegisterScreen } from "../screens/auth/RegisterScreen";
import { ForgotPasswordScreen } from "../screens/auth/ForgotPasswordScreen";
import { ResetPasswordScreen } from "../screens/auth/ResetPasswordScreen";
import { CurrentRatesScreen } from "../screens/rates/CurrentRatesScreen";
import { TradeScreen } from "../screens/trade/TradeScreen";
import { WalletScreen } from "../screens/wallet/WalletScreen";
import { HistoryScreen } from "../screens/history/HistoryScreen";
import { HomeScreen } from "../screens/home/HomeScreen";

// Types
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token?: string };
};

export type MainTabParamList = {
  Home: undefined;
  Rates: undefined;
  Trade: undefined;
  Wallet: undefined;
};

export type RootStackParamList = {
  MainTabs: undefined;
  History: undefined;
};

export type WalletStackParamList = {
  WalletMain: undefined;
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const WalletStack = createNativeStackNavigator<WalletStackParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const AuthNavigator = () => {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
      />
      <AuthStack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </AuthStack.Navigator>
  );
};

const WalletNavigator = () => {
  return (
    <WalletStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <WalletStack.Screen name="WalletMain" component={WalletScreen} />
    </WalletStack.Navigator>
  );
};

const MainNavigator = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          height: 50 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 4,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textTertiary,
        tabBarIcon: ({ color, size }) => {
          let Icon: LucideIcon;

          switch (route.name) {
            case "Home":
              Icon = TrendingUp;
              break;
            case "Rates":
              Icon = TrendingUp;
              break;
            case "Trade":
              Icon = ArrowRightLeft;
              break;
            case "Wallet":
              Icon = Wallet;
              break;
            default:
              Icon = TrendingUp;
          }

          return <Icon color={color} size={size} />;
        },
        tabBarLabel: ({ focused, color }) => (
          <Typography
            variant="caption"
            color={color}
            weight={focused ? "medium" : "regular"}
            style={{ fontSize: 10 }}
          >
            {route.name}
          </Typography>
        ),
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tab.Screen name="Rates" component={CurrentRatesScreen} />
      <Tab.Screen name="Trade" component={TradeScreen} />
      <Tab.Screen name="Wallet" component={WalletNavigator} />
    </Tab.Navigator>
  );
};

const RootNavigator = () => {
  return (
    <RootStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <RootStack.Screen
        name="MainTabs"
        component={MainNavigator}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name="History"
        component={HistoryScreen}
        options={{ presentation: "modal", headerShown: false }}
      />
    </RootStack.Navigator>
  );
};

import { AuthProvider, useAuth } from "../context/AuthContext";
import { WalletProvider } from "../context/WalletContext";
import { FavoritesProvider } from "../context/FavoritesContext";

const AppContent = () => {
  const { isAuthenticated } = useAuth();

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <WalletProvider>
          <FavoritesProvider>
            <WalletProvider>
              <FavoritesProvider>
                <RootNavigator />
              </FavoritesProvider>
            </WalletProvider>
          </FavoritesProvider>
        </WalletProvider>
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
};

export const AppNavigator = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};
