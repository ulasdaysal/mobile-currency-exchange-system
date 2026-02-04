import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { History } from "lucide-react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { ScreenWrapper } from "../../components/ScreenWrapper";
import { Typography } from "../../components/Typography";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { theme } from "../../theme/theme";
import { walletRepository } from "../../../data/repositories/WalletRepository";
import { useAuth } from "../../context/AuthContext";
import { useWallet } from "../../context/WalletContext";

export const WalletScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { logout } = useAuth();
  const { balances, totalBalance, isLoading, refreshWallet } = useWallet();

  // Filter out zero balances
  const nonZeroBalances = balances.filter((b) => b.amount > 0);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFundModal, setShowFundModal] = useState(false);
  const [fundAmount, setFundAmount] = useState("");
  const [isFunding, setIsFunding] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultMessage, setResultMessage] = useState({
    success: true,
    message: "",
  });

  useEffect(() => {
    refreshWallet();
  }, [refreshWallet]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshWallet();
    setIsRefreshing(false);
  };

  const handleAddFunds = async () => {
    const amount = parseFloat(fundAmount);
    if (!amount || amount <= 0) {
      setResultMessage({
        success: false,
        message: "Please enter a valid amount.",
      });
      setShowResultModal(true);
      return;
    }

    setIsFunding(true);
    try {
      await walletRepository.addFunds({ amount });
      setResultMessage({
        success: true,
        message: `Added ${amount.toFixed(2)} PLN to your wallet!`,
      });
      setFundAmount("");
      setShowFundModal(false);
      await refreshWallet();
    } catch {
      setResultMessage({
        success: false,
        message: "Failed to add funds. Please try again.",
      });
    } finally {
      setIsFunding(false);
      setShowResultModal(true);
    }
  };

  const handleLogout = () => {
    setResultMessage({
      success: true,
      message: "Are you sure you want to logout?",
    });
    setShowResultModal(true);
  };

  const confirmLogout = async () => {
    setShowResultModal(false);
    await logout();
  };

  if (isLoading && balances.length === 0) {
    return (
      <ScreenWrapper style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Typography
          variant="body"
          color={theme.colors.textSecondary}
          style={styles.loadingText}
        >
          Loading wallet...
        </Typography>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Typography variant="h2" style={styles.title}>
            My Wallet
          </Typography>
          <TouchableOpacity
            onPress={() => navigation.navigate("History")}
            style={styles.historyButton}
          >
            <History color={theme.colors.primary} size={24} />
          </TouchableOpacity>
        </View>
        <Card style={styles.totalCard} variant="elevated">
          <Typography variant="body" color={theme.colors.textSecondary}>
            Total Balance (Est.)
          </Typography>
          <Typography variant="h1" weight="bold">
            {totalBalance.toFixed(2)} PLN
          </Typography>
          <View style={styles.actionRow}>
            <Button
              title="Add Funds"
              variant="secondary"
              onPress={() => setShowFundModal(true)}
              style={styles.actionButton}
            />
            <Button
              title="Logout"
              variant="outline"
              onPress={handleLogout}
              style={styles.actionButton}
            />
          </View>
        </Card>
      </View>

      <Typography variant="h3" style={styles.sectionTitle}>
        Assets
      </Typography>

      {nonZeroBalances.length === 0 ? (
        <View style={styles.emptyState}>
          <Typography
            variant="body"
            color={theme.colors.textSecondary}
            align="center"
          >
            No assets yet. Add funds to get started!
          </Typography>
        </View>
      ) : (
        <FlatList
          data={nonZeroBalances}
          keyExtractor={(item) => item.currencyCode}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={theme.colors.primary}
            />
          }
          renderItem={({ item }) => (
            <Card style={styles.assetCard} padding="md">
              <View style={styles.assetRow}>
                <View style={styles.iconPlaceholder}>
                  <Typography variant="h3">{item.currencyCode[0]}</Typography>
                </View>
                <View style={styles.assetInfo}>
                  <Typography variant="body" weight="bold">
                    {item.currencyCode}
                  </Typography>
                  <Typography
                    variant="caption"
                    color={theme.colors.textSecondary}
                  >
                    {item.currencyName}
                  </Typography>
                </View>
                <View style={styles.assetValues}>
                  <Typography variant="body" weight="bold">
                    {item.amount.toFixed(2)}
                  </Typography>
                  {!item.isBase && (
                    <Typography
                      variant="caption"
                      color={theme.colors.textSecondary}
                    >
                      ≈ {item.valueInPln.toFixed(2)} PLN
                    </Typography>
                  )}
                </View>
              </View>
            </Card>
          )}
        />
      )}

      {/* Add Funds Modal */}
      <Modal visible={showFundModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Card style={styles.modalContent}>
            <Typography variant="h3" weight="bold" style={styles.modalTitle}>
              Add Funds
            </Typography>
            <Typography
              variant="body"
              color={theme.colors.textSecondary}
              style={styles.modalSubtitle}
            >
              Enter amount in PLN to add to your wallet
            </Typography>
            <TextInput
              style={styles.modalInput}
              placeholder="0.00"
              placeholderTextColor={theme.colors.textTertiary}
              keyboardType="numeric"
              value={fundAmount}
              onChangeText={(text) => {
                // Allow numbers and one decimal point
                const numericValue = text.replace(/[^0-9.]/g, "");

                // Prevent multiple decimal points
                const parts = numericValue.split(".");
                if (parts.length > 2) {
                  setFundAmount(parts[0] + "." + parts.slice(1).join(""));
                } else {
                  setFundAmount(numericValue);
                }
              }}
            />
            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => setShowFundModal(false)}
                style={styles.modalButton}
              />
              <Button
                title="Add Funds"
                variant="primary"
                onPress={handleAddFunds}
                loading={isFunding}
                style={styles.modalButton}
              />
            </View>
          </Card>
        </View>
      </Modal>

      {/* Result/Confirm Modal */}
      <Modal visible={showResultModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Card style={styles.modalContent}>
            <Typography variant="h3" weight="bold" style={styles.modalTitle}>
              {resultMessage.message.includes("logout")
                ? "Confirm"
                : resultMessage.success
                  ? "✓"
                  : "✗"}
            </Typography>
            <Typography
              variant="body"
              color={theme.colors.textSecondary}
              style={styles.modalSubtitle}
            >
              {resultMessage.message}
            </Typography>
            {resultMessage.message.includes("logout") ? (
              <View style={styles.modalButtons}>
                <Button
                  title="Cancel"
                  variant="outline"
                  onPress={() => setShowResultModal(false)}
                  style={styles.modalButton}
                />
                <Button
                  title="Logout"
                  variant="primary"
                  onPress={confirmLogout}
                  style={[
                    styles.modalButton,
                    { backgroundColor: theme.colors.error },
                  ]}
                />
              </View>
            ) : (
              <Button
                title="OK"
                variant="primary"
                onPress={() => setShowResultModal(false)}
                fullWidth
              />
            )}
          </Card>
        </View>
      </Modal>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: theme.spacing.xl,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  title: {
    marginBottom: 0,
  },
  historyButton: {
    padding: 4,
  },
  totalCard: {
    padding: theme.spacing.lg,
    alignItems: "center",
  },
  actionRow: {
    flexDirection: "row",
    marginTop: theme.spacing.lg,
    gap: theme.spacing.md,
    width: "100%",
  },
  actionButton: {
    flex: 1,
  },
  sectionTitle: {
    marginBottom: theme.spacing.md,
  },
  list: {
    paddingBottom: theme.spacing.xl,
  },
  assetCard: {
    marginBottom: theme.spacing.md,
  },
  assetRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surfaceHighlight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing.md,
  },
  assetInfo: {
    flex: 1,
  },
  assetValues: {
    alignItems: "flex-end",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: theme.spacing.md,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    paddingVertical: theme.spacing.xxl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.lg,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
    padding: theme.spacing.xl,
  },
  modalTitle: {
    marginBottom: theme.spacing.xs,
    textAlign: "center",
  },
  modalSubtitle: {
    marginBottom: theme.spacing.lg,
    textAlign: "center",
  },
  modalInput: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.typography.sizes.xl,
    color: theme.colors.textPrimary,
    textAlign: "center",
    marginBottom: theme.spacing.lg,
  },
  modalButtons: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  modalButton: {
    flex: 1,
  },
});
