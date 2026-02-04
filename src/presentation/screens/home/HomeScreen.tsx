import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { ScreenWrapper } from "../../components/ScreenWrapper";
import { Typography } from "../../components/Typography";
import { Card } from "../../components/Card";
import { theme } from "../../theme/theme";
import { useWallet } from "../../context/WalletContext";
import { useFavorites } from "../../context/FavoritesContext";

import { Transaction } from "../../../domain/entities/Transaction";
import { ratesRepository } from "../../../data/repositories/RatesRepository";
import { Rate } from "../../../domain/entities/Rate";
import { useFocusEffect } from "@react-navigation/native";

export const HomeScreen = () => {
  const { totalBalance, refreshWallet, recentTransactions } = useWallet();
  const { favorites } = useFavorites();
  const [favoriteRates, setFavoriteRates] = React.useState<Rate[]>([]);

  // Fetch data on screen focus
  useFocusEffect(
    React.useCallback(() => {
      refreshWallet();
      refreshWallet();
      fetchFavoriteRates();
    }, [refreshWallet, favorites]),
  );

  const fetchFavoriteRates = async () => {
    if (favorites.length === 0) {
      setFavoriteRates([]);
      return;
    }
    try {
      const rates = await ratesRepository.getCurrentRates();
      const favRates = rates.filter((r: Rate) => favorites.includes(r.code));
      setFavoriteRates(favRates);
    } catch (e) {
      console.error("Failed to fetch rates", e);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <ScreenWrapper>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Typography variant="h2">Home</Typography>
        </View>

        {/* Balance Widget */}
        <Card style={styles.balanceCard} variant="elevated">
          <Typography variant="body" color={theme.colors.textSecondary}>
            Total Balance (Est.)
          </Typography>
          <Typography variant="h1" weight="bold">
            {totalBalance.toFixed(2)} PLN
          </Typography>
        </Card>

        {/* Favorites Section */}
        <View style={styles.sectionHeader}>
          <Typography variant="h3">Favorites</Typography>
        </View>

        {favorites.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Typography variant="body" color={theme.colors.textSecondary}>
              No favorites yet. Add them from Rates!
            </Typography>
          </Card>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.favoritesScroll}
          >
            {favoriteRates.map((rate) => (
              <Card key={rate.code} style={styles.favoriteCard}>
                <View style={styles.flagContainer}>
                  <Typography variant="h2">{rate.code[0]}</Typography>
                </View>
                <Typography variant="h3" weight="bold">
                  {rate.code}
                </Typography>
                <Typography variant="body" color={theme.colors.textSecondary}>
                  {rate.midRate.toFixed(4)} PLN
                </Typography>
              </Card>
            ))}
          </ScrollView>
        )}

        {/* Recent Transactions Section */}
        <View style={styles.sectionHeader}>
          <Typography variant="h3">Recent Activity</Typography>
        </View>

        {recentTransactions.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Typography variant="body" color={theme.colors.textSecondary}>
              No recent activity.
            </Typography>
          </Card>
        ) : (
          <View style={styles.transactionsList}>
            {recentTransactions.map((item) => (
              <Card key={item.id} style={styles.transactionCard}>
                <View style={styles.transactionRow}>
                  <View>
                    <Typography variant="body" weight="bold">
                      {item.type.toUpperCase()} {item.fromCurrency}
                    </Typography>
                    <Typography
                      variant="caption"
                      color={theme.colors.textSecondary}
                    >
                      {formatDate(item.createdAt)}
                    </Typography>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Typography
                      variant="body"
                      weight="bold"
                      color={
                        item.type === "buy"
                          ? theme.colors.error
                          : theme.colors.success
                      }
                    >
                      {item.type === "buy" ? "-" : "+"}
                      {item.fromAmount.toFixed(2)}
                    </Typography>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: theme.spacing.xl,
  },
  header: {
    marginBottom: theme.spacing.lg,
  },
  balanceCard: {
    padding: theme.spacing.lg,
    alignItems: "center",
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  favoritesScroll: {
    marginBottom: theme.spacing.md,
  },
  favoriteCard: {
    marginRight: theme.spacing.md,
    width: 140,
    alignItems: "center",
    padding: theme.spacing.md,
  },
  flagContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.surfaceHighlight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  emptyCard: {
    padding: theme.spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  transactionsList: {
    gap: theme.spacing.sm,
  },
  transactionCard: {
    padding: theme.spacing.md,
  },
  transactionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
