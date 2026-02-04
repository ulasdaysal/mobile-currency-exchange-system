import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { X } from "lucide-react-native";
import { ScreenWrapper } from "../../components/ScreenWrapper";
import { Typography } from "../../components/Typography";
import { Card } from "../../components/Card";
import { theme } from "../../theme/theme";
import {
  Transaction,
  TransactionType,
} from "../../../domain/entities/Transaction";
import { transactionRepository } from "../../../data/repositories/TransactionRepository";

const FILTER_OPTIONS: { label: string; value: TransactionType | undefined }[] =
  [
    { label: "All", value: undefined },
    { label: "Deposits", value: "deposit" },
    { label: "Buys", value: "buy" },
    { label: "Sells", value: "sell" },
  ];

export const HistoryScreen = () => {
  const navigation = useNavigation();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<
    TransactionType | undefined
  >(undefined);

  const fetchHistory = useCallback(
    async (showRefreshIndicator = false) => {
      if (showRefreshIndicator) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        const history = await transactionRepository.getHistory({
          type: selectedFilter,
        });
        setTransactions(history);
      } catch {
        /* Handle error silently */
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [selectedFilter],
  );

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleRefresh = () => fetchHistory(true);

  const getStatusColor = (type: TransactionType) => {
    switch (type) {
      case "buy":
        return theme.colors.error;
      case "sell":
        return theme.colors.success;
      case "deposit":
        return theme.colors.info;
      default:
        return theme.colors.textSecondary;
    }
  };

  const formatType = (type: TransactionType) => type.toUpperCase();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <ScreenWrapper style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Typography
          variant="body"
          color={theme.colors.textSecondary}
          style={styles.loadingText}
        >
          Loading history...
        </Typography>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <Typography variant="h2">History</Typography>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.closeButton}
        >
          <X color={theme.colors.textPrimary} size={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        {FILTER_OPTIONS.map((filter) => (
          <TouchableOpacity
            key={filter.label}
            style={[
              styles.filterChip,
              selectedFilter === filter.value && styles.filterChipActive,
            ]}
            onPress={() => setSelectedFilter(filter.value)}
          >
            <Typography
              variant="caption"
              weight="medium"
              color={
                selectedFilter === filter.value
                  ? theme.colors.textInverse
                  : theme.colors.textSecondary
              }
            >
              {filter.label}
            </Typography>
          </TouchableOpacity>
        ))}
      </View>

      {transactions.length === 0 ? (
        <View style={styles.emptyState}>
          <Typography
            variant="body"
            color={theme.colors.textSecondary}
            align="center"
          >
            {selectedFilter
              ? `No ${selectedFilter} transactions found.`
              : "No transactions yet. Make a trade to get started!"}
          </Typography>
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={theme.colors.primary}
            />
          }
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <View style={styles.row}>
                <View>
                  <Typography
                    variant="body"
                    weight="bold"
                    color={theme.colors.textPrimary}
                  >
                    {formatType(item.type)}{" "}
                    {item.toCurrency !== item.fromCurrency
                      ? `${item.fromCurrency} → ${item.toCurrency}`
                      : ""}
                  </Typography>
                  <Typography
                    variant="caption"
                    color={theme.colors.textSecondary}
                  >
                    {formatDate(item.createdAt)}
                  </Typography>
                  {item.type !== "deposit" && (
                    <Typography
                      variant="caption"
                      color={theme.colors.textTertiary}
                    >
                      Rate: {item.rateUsed.toFixed(4)}
                    </Typography>
                  )}
                </View>
                <View style={styles.amountContainer}>
                  <Typography
                    variant="body"
                    weight="bold"
                    color={getStatusColor(item.type)}
                  >
                    {item.type === "buy" ? "-" : "+"}
                    {item.fromAmount.toFixed(2)} {item.fromCurrency}
                  </Typography>
                  {item.type !== "deposit" && (
                    <Typography
                      variant="caption"
                      color={theme.colors.textSecondary}
                    >
                      ≈ {item.toAmount.toFixed(2)} {item.toCurrency}
                    </Typography>
                  )}
                </View>
              </View>
            </Card>
          )}
        />
      )}
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  closeButton: {
    padding: 4,
  },
  filterContainer: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  filterChip: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.round,
    backgroundColor: theme.colors.surface,
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary,
  },
  list: {
    paddingBottom: theme.spacing.xl,
  },
  card: {
    marginBottom: theme.spacing.sm,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  amountContainer: {
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
});
