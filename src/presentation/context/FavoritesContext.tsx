import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface FavoritesContextType {
  favorites: string[];
  addFavorite: (currencyCode: string) => Promise<void>;
  removeFavorite: (currencyCode: string) => Promise<void>;
  isFavorite: (currencyCode: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(
  undefined,
);

const FAVORITES_STORAGE_KEY = "@favorites";

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.error("Failed to load favorites", error);
    }
  };

  const saveFavorites = async (newFavorites: string[]) => {
    try {
      await AsyncStorage.setItem(
        FAVORITES_STORAGE_KEY,
        JSON.stringify(newFavorites),
      );
    } catch (error) {
      console.error("Failed to save favorites", error);
    }
  };

  const addFavorite = async (currencyCode: string) => {
    if (!favorites.includes(currencyCode)) {
      const newFavorites = [...favorites, currencyCode];
      setFavorites(newFavorites);
      await saveFavorites(newFavorites);
    }
  };

  const removeFavorite = async (currencyCode: string) => {
    const newFavorites = favorites.filter((code) => code !== currencyCode);
    setFavorites(newFavorites);
    await saveFavorites(newFavorites);
  };

  const isFavorite = (currencyCode: string) => {
    return favorites.includes(currencyCode);
  };

  return (
    <FavoritesContext.Provider
      value={{ favorites, addFavorite, removeFavorite, isFavorite }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
};
