import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@currency_exchange_token';
const USER_KEY = '@currency_exchange_user';

export const TokenStorage = {
  async saveToken(token: string): Promise<void> {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  },

  async getToken(): Promise<string | null> {
    return AsyncStorage.getItem(TOKEN_KEY);
  },

  async removeToken(): Promise<void> {
    await AsyncStorage.removeItem(TOKEN_KEY);
  },

  async saveUser(user: string): Promise<void> {
    await AsyncStorage.setItem(USER_KEY, user);
  },

  async getUser(): Promise<string | null> {
    return AsyncStorage.getItem(USER_KEY);
  },

  async clearAll(): Promise<void> {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
  },
};
