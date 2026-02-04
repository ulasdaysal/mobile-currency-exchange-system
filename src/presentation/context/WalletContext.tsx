import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useCallback,
} from "react";
import { WalletBalance } from "../../domain/entities/WalletBalance";
import { walletRepository } from "../../data/repositories/WalletRepository";
import { Transaction } from "../../domain/entities/Transaction";
import { transactionRepository } from "../../data/repositories/TransactionRepository";

interface WalletContextType {
  balances: WalletBalance[];
  totalBalance: number;
  isLoading: boolean;
  refreshWallet: () => Promise<void>;
  getBalance: (currencyCode: string) => number;
  recentTransactions: Transaction[];
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [balances, setBalances] = useState<WalletBalance[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>(
    [],
  );

  const refreshWallet = useCallback(async () => {
    setIsLoading(true);
    try {
      const [fetchedBalances, total, history] = await Promise.all([
        walletRepository.getBalances(),
        walletRepository.getTotalBalanceInPln(),
        transactionRepository.getHistory({ limit: 5 }),
      ]);
      setBalances(fetchedBalances);
      setTotalBalance(total);
      setRecentTransactions(history);
    } catch (err) {
      console.error("[WalletContext] Failed to refresh wallet:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getBalance = useCallback(
    (currencyCode: string): number => {
      const balance = balances.find((b) => b.currencyCode === currencyCode);
      return balance?.amount || 0;
    },
    [balances],
  );

  return (
    <WalletContext.Provider
      value={{
        balances,
        totalBalance,
        isLoading,
        refreshWallet,
        getBalance,
        recentTransactions,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};
