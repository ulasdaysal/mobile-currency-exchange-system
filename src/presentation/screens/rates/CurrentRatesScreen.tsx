import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { ScreenWrapper } from "../../components/ScreenWrapper";
import { Typography } from "../../components/Typography";
import { Card } from "../../components/Card";
import { theme } from "../../theme/theme";
import { Input } from "../../components/Input";
import { Rate } from "../../../domain/entities/Rate";
import { ratesRepository } from "../../../data/repositories/RatesRepository";
import { Star } from "lucide-react-native";
import { useFavorites } from "../../context/FavoritesContext";

export const CurrentRatesScreen = () => {
  const [rates, setRates] = useState<Rate[]>([]);
  const [filteredRates, setFilteredRates] = useState<Rate[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [effectiveDate, setEffectiveDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();

  const fetchRates = useCallback(async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const fetchedRates = await ratesRepository.getCurrentRates();
      setRates(fetchedRates);
      setFilteredRates(fetchedRates);
      if (fetchedRates.length > 0) {
        setEffectiveDate(fetchedRates[0].effectiveDate);
      }
    } catch (err) {
      setError("Failed to load exchange rates. Pull to retry.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredRates(rates);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = rates.filter(
      (rate) =>
        rate.code.toLowerCase().includes(query) ||
        rate.name.toLowerCase().includes(query),
    );
    setFilteredRates(filtered);
  }, [searchQuery, rates]);

  const handleRefresh = () => fetchRates(true);

  if (isLoading) {
    return (
      <ScreenWrapper style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Typography
          variant="body"
          color={theme.colors.textSecondary}
          style={styles.loadingText}
        >
          Loading rates...
        </Typography>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <Typography variant="h2" style={styles.title}>
          Exchange Rates
        </Typography>
        <Typography variant="caption" color={theme.colors.textSecondary}>
          Effective Date: {effectiveDate || "N/A"}
        </Typography>
      </View>

      <View style={styles.searchContainer}>
        <Input
          placeholder="Search currency..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {error ? (
        <View style={styles.centerContainer}>
          <Typography variant="body" color={theme.colors.error} align="center">
            {error}
          </Typography>
        </View>
      ) : filteredRates.length === 0 ? (
        <View style={styles.centerContainer}>
          <Typography
            variant="body"
            color={theme.colors.textSecondary}
            align="center"
          >
            {searchQuery
              ? "No currencies match your search."
              : "No rates available."}
          </Typography>
        </View>
      ) : (
        <FlatList
          data={filteredRates}
          keyExtractor={(item) => item.code}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={theme.colors.primary}
            />
          }
          renderItem={({ item }) => (
            <Card style={styles.rateCard}>
              <View style={styles.currencyInfo}>
                <View style={styles.flagContainer}>
                  <Typography variant="h3">{item.flag}</Typography>
                </View>
                <View>
                  <Typography variant="h3" weight="bold">
                    {item.code}
                  </Typography>
                  <Typography
                    variant="caption"
                    color={theme.colors.textSecondary}
                  >
                    {item.name}
                  </Typography>
                </View>
              </View>
              <View style={styles.ratesContainer}>
                <View style={styles.rateColumn}>
                  <Typography
                    variant="caption"
                    color={theme.colors.textSecondary}
                  >
                    BUY
                  </Typography>
                  <Typography
                    variant="body"
                    weight="medium"
                    color={theme.colors.success}
                  >
                    {item.buyRate.toFixed(4)}
                  </Typography>
                </View>
                <View style={styles.divider} />
                <View style={styles.rateColumn}>
                  <Typography
                    variant="caption"
                    color={theme.colors.textSecondary}
                  >
                    SELL
                  </Typography>
                  <Typography
                    variant="body"
                    weight="medium"
                    color={theme.colors.error}
                  >
                    {item.sellRate.toFixed(4)}
                  </Typography>
                </View>
              </View>
              <TouchableOpacity
                onPress={() =>
                  isFavorite(item.code)
                    ? removeFavorite(item.code)
                    : addFavorite(item.code)
                }
                style={styles.favoriteButton}
              >
                <Star
                  size={24}
                  color={
                    isFavorite(item.code)
                      ? theme.colors.primary
                      : theme.colors.textTertiary
                  }
                  fill={
                    isFavorite(item.code) ? theme.colors.primary : "transparent"
                  }
                />
              </TouchableOpacity>
            </Card>
          )}
        />
      )}
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    marginBottom: theme.spacing.xs,
  },
  searchContainer: {
    marginBottom: theme.spacing.md,
  },
  listContent: {
    paddingBottom: theme.spacing.xl,
  },
  rateCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  currencyInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  flagContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surfaceHighlight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing.md,
  },
  ratesContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rateColumn: {
    alignItems: "flex-end",
    minWidth: 70,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: theme.colors.border,
    marginHorizontal: theme.spacing.md,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: theme.spacing.md,
  },
  favoriteButton: {
    marginLeft: theme.spacing.md,
    padding: 4,
  },
});
