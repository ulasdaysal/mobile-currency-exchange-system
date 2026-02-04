import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
} from "react-native";
import { ScreenWrapper } from "../../components/ScreenWrapper";
import { Typography } from "../../components/Typography";
import { Card } from "../../components/Card";
import { theme } from "../../theme/theme";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { Rate } from "../../../domain/entities/Rate";
import { ratesRepository } from "../../../data/repositories/RatesRepository";
import { transactionRepository } from "../../../data/repositories/TransactionRepository";
import { useWallet } from "../../context/WalletContext";

const POPULAR_CURRENCIES = ["EUR", "USD", "GBP", "CHF"];

export const TradeScreen = () => {
  const { getBalance, refreshWallet } = useWallet();

  const [type, setType] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("EUR");
  const [rate, setRate] = useState<Rate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTrading, setIsTrading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultMessage, setResultMessage] = useState({
    success: true,
    message: "",
  });
  const [error, setError] = useState<string | null>(null);

  const plnBalance = getBalance("PLN");
  const currencyBalance = getBalance(selectedCurrency);

  const fetchRate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedRate =
        await ratesRepository.getRateForCurrency(selectedCurrency);
      setRate(fetchedRate);
    } catch (err) {
      console.error("[TradeScreen] Rate fetch error:", err);
      setError("Failed to fetch exchange rate. Check your connection.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedCurrency]);

  useEffect(() => {
    fetchRate();
    refreshWallet();
  }, [fetchRate, refreshWallet]);

  const currentRate = rate
    ? type === "buy"
      ? rate.buyRate
      : rate.sellRate
    : 0;
  const numericAmount = parseFloat(amount) || 0;

  const estimatedResult =
    type === "buy" ? numericAmount * currentRate : numericAmount * currentRate;

  const resultCurrency = type === "buy" ? "PLN" : selectedCurrency;
  const inputCurrency = selectedCurrency;

  const canTrade = numericAmount > 0 && rate && !isTrading && !error;

  const handleTradePress = () => {
    if (!canTrade) return;
    setShowConfirmModal(true);
  };

  const executeTrade = async () => {
    setShowConfirmModal(false);
    setIsTrading(true);

    try {
      await transactionRepository.executeTrade({
        type,
        currencyCode: selectedCurrency,
        amount: numericAmount,
      });
      setResultMessage({
        success: true,
        message: `Successfully ${type === "buy" ? "bought" : "sold"} ${numericAmount} ${selectedCurrency}!`,
      });
      setAmount("");
      // Refresh wallet to update balances across all screens
      await refreshWallet();
    } catch (err: unknown) {
      console.error("[TradeScreen] Trade error:", err);
      const message =
        err instanceof Error ? err.message : "Trade failed. Please try again.";
      setResultMessage({ success: false, message });
    } finally {
      setIsTrading(false);
      setShowResultModal(true);
    }
  };

  return (
    <ScreenWrapper>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Typography variant="h2" style={styles.title}>
          Trade Currency
        </Typography>

        <View style={styles.currencySelector}>
          {POPULAR_CURRENCIES.map((code) => (
            <TouchableOpacity
              key={code}
              style={[
                styles.currencyChip,
                selectedCurrency === code && styles.currencyChipActive,
              ]}
              onPress={() => setSelectedCurrency(code)}
            >
              <Typography
                weight="medium"
                color={
                  selectedCurrency === code
                    ? theme.colors.textInverse
                    : theme.colors.textSecondary
                }
              >
                {code}
              </Typography>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, type === "buy" && styles.activeBuy]}
            onPress={() => setType("buy")}
          >
            <Typography
              weight="bold"
              color={
                type === "buy"
                  ? theme.colors.textInverse
                  : theme.colors.textSecondary
              }
            >
              BUY {selectedCurrency}
            </Typography>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, type === "sell" && styles.activeSell]}
            onPress={() => setType("sell")}
          >
            <Typography
              weight="bold"
              color={
                type === "sell"
                  ? theme.colors.textInverse
                  : theme.colors.textSecondary
              }
            >
              SELL {selectedCurrency}
            </Typography>
          </TouchableOpacity>
        </View>

        <Card style={styles.rateCard}>
          {isLoading ? (
            <ActivityIndicator color={theme.colors.primary} />
          ) : error ? (
            <>
              <Typography
                variant="body"
                color={theme.colors.error}
                align="center"
              >
                {error}
              </Typography>
              <Button
                title="Retry"
                onPress={fetchRate}
                variant="outline"
                style={{ marginTop: theme.spacing.md }}
              />
            </>
          ) : (
            <>
              <Typography
                variant="body"
                color={theme.colors.textSecondary}
                align="center"
              >
                Exchange Rate (
                {type === "buy"
                  ? `PLN → ${selectedCurrency}`
                  : `${selectedCurrency} → PLN`}
                )
              </Typography>
              <Typography variant="h1" align="center" style={styles.rateText}>
                1 {selectedCurrency} = {currentRate.toFixed(4)} PLN
              </Typography>
            </>
          )}
        </Card>

        <View style={styles.balanceInfo}>
          <Typography variant="caption" color={theme.colors.textSecondary}>
            Available:{" "}
            {type === "buy"
              ? `${plnBalance.toFixed(2)} PLN`
              : `${currencyBalance.toFixed(2)} ${selectedCurrency}`}
          </Typography>
        </View>

        <View style={styles.form}>
          <Input
            label={`Amount (${inputCurrency})`}
            placeholder="0.00"
            keyboardType="numeric"
            value={amount}
            onChangeText={(text) => {
              // Allow numbers and one decimal point
              const numericValue = text.replace(/[^0-9.]/g, "");

              // Prevent multiple decimal points
              const parts = numericValue.split(".");
              if (parts.length > 2) {
                // If multiple dots, keep only the first two parts joined by a dot
                setAmount(parts[0] + "." + parts.slice(1).join(""));
              } else {
                setAmount(numericValue);
              }
            }}
            style={styles.input}
          />

          <View style={styles.summaryContainer}>
            <Typography variant="body" color={theme.colors.textSecondary}>
              {type === "buy" ? "Total Cost:" : "You will receive:"}
            </Typography>
            <Typography variant="h2" weight="bold">
              {estimatedResult.toFixed(2)} {resultCurrency}
            </Typography>
          </View>

          <Button
            title={
              isTrading
                ? "Processing..."
                : type === "buy"
                  ? `Buy ${selectedCurrency}`
                  : `Sell ${selectedCurrency}`
            }
            variant="primary"
            onPress={handleTradePress}
            loading={isTrading}
            disabled={!canTrade}
            style={{
              backgroundColor: canTrade
                ? type === "buy"
                  ? theme.colors.success
                  : theme.colors.error
                : theme.colors.surfaceHighlight,
            }}
          />

          {!canTrade && numericAmount > 0 && !isTrading && (
            <Typography
              variant="caption"
              color={theme.colors.textSecondary}
              align="center"
              style={styles.hint}
            >
              {error
                ? "Fix the error above to trade"
                : "Enter a valid amount to trade"}
            </Typography>
          )}
        </View>
      </ScrollView>

      {/* Confirmation Modal */}
      <Modal visible={showConfirmModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Card style={styles.modalContent}>
            <Typography variant="h3" weight="bold" style={styles.modalTitle}>
              Confirm Trade
            </Typography>
            <Typography
              variant="body"
              color={theme.colors.textSecondary}
              style={styles.modalSubtitle}
            >
              {type === "buy"
                ? `Buy ${numericAmount} ${selectedCurrency} for ${estimatedResult.toFixed(2)} PLN?`
                : `Sell ${numericAmount} ${selectedCurrency} for ${estimatedResult.toFixed(2)} PLN?`}
            </Typography>
            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => setShowConfirmModal(false)}
                style={styles.modalButton}
              />
              <Button
                title="Confirm"
                variant="primary"
                onPress={executeTrade}
                style={[
                  styles.modalButton,
                  {
                    backgroundColor:
                      type === "buy"
                        ? theme.colors.success
                        : theme.colors.error,
                  },
                ]}
              />
            </View>
          </Card>
        </View>
      </Modal>

      {/* Result Modal */}
      <Modal visible={showResultModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Card style={styles.modalContent}>
            <Typography
              variant="h3"
              weight="bold"
              style={styles.modalTitle}
              color={
                resultMessage.success
                  ? theme.colors.success
                  : theme.colors.error
              }
            >
              {resultMessage.success ? "✓ Success!" : "✗ Failed"}
            </Typography>
            <Typography
              variant="body"
              color={theme.colors.textSecondary}
              style={styles.modalSubtitle}
            >
              {resultMessage.message}
            </Typography>
            <Button
              title="OK"
              variant="primary"
              onPress={() => setShowResultModal(false)}
              fullWidth
            />
          </Card>
        </View>
      </Modal>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  title: {
    marginBottom: theme.spacing.lg,
  },
  currencySelector: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  currencyChip: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    alignItems: "center",
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
  },
  currencyChipActive: {
    backgroundColor: theme.colors.primary,
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: 4,
    marginBottom: theme.spacing.lg,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    alignItems: "center",
    borderRadius: theme.borderRadius.md,
  },
  activeBuy: {
    backgroundColor: theme.colors.success,
  },
  activeSell: {
    backgroundColor: theme.colors.error,
  },
  rateCard: {
    marginBottom: theme.spacing.md,
    paddingVertical: theme.spacing.xl,
  },
  rateText: {
    marginTop: theme.spacing.xs,
    color: theme.colors.primaryLight,
  },
  balanceInfo: {
    marginBottom: theme.spacing.lg,
    alignItems: "flex-end",
  },
  form: {
    gap: theme.spacing.lg,
  },
  input: {
    fontSize: theme.typography.sizes.xl,
    textAlign: "right",
  },
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
  },
  hint: {
    marginTop: theme.spacing.sm,
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
  modalButtons: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  modalButton: {
    flex: 1,
  },
});
