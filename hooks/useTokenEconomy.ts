import { useState, useEffect, useCallback } from 'react';
import type {
  TokenBalance,
  TokenTransaction,
  TokenEarningRule,
  TokenSpendingOption,
} from '../types';

interface UseTokenEconomyOptions {
  userId: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseTokenEconomyReturn {
  // State
  balance: TokenBalance | null;
  transactions: TokenTransaction[];
  earningRules: TokenEarningRule[];
  spendingOptions: TokenSpendingOption[];
  loading: boolean;
  error: string | null;

  // Actions
  refreshBalance: () => Promise<void>;
  refreshTransactions: () => Promise<void>;
  refreshEarningRules: () => Promise<void>;
  refreshSpendingOptions: () => Promise<void>;
  earnTokens: (amount: number, reason: string, type?: 'earned' | 'bonus', metadata?: Record<string, any>) => Promise<TokenTransaction>;
  spendTokens: (amount: number, reason: string, metadata?: Record<string, any>) => Promise<TokenTransaction>;
  purchaseItem: (spendingOptionId: string) => Promise<TokenTransaction>;
  refreshAll: () => Promise<void>;
}

export function useTokenEconomy({
  userId,
  autoRefresh = false,
  refreshInterval = 30000, // 30 seconds
}: UseTokenEconomyOptions): UseTokenEconomyReturn {
  const [balance, setBalance] = useState<TokenBalance | null>(null);
  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
  const [earningRules, setEarningRules] = useState<TokenEarningRule[]>([]);
  const [spendingOptions, setSpendingOptions] = useState<TokenSpendingOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshBalance = useCallback(async () => {
    try {
      const response = await fetch(`/api/gamification/tokens/balance?userId=${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch token balance');
      }
      const data = await response.json();
      setBalance(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch token balance');
    }
  }, [userId]);

  const refreshTransactions = useCallback(async () => {
    try {
      const response = await fetch(`/api/gamification/tokens/transactions?userId=${userId}&limit=20`);
      if (!response.ok) {
        throw new Error('Failed to fetch token transactions');
      }
      const data = await response.json();
      setTransactions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch token transactions');
    }
  }, [userId]);

  const refreshEarningRules = useCallback(async () => {
    try {
      const response = await fetch('/api/gamification/tokens/earning-rules');
      if (!response.ok) {
        throw new Error('Failed to fetch earning rules');
      }
      const data = await response.json();
      setEarningRules(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch earning rules');
    }
  }, []);

  const refreshSpendingOptions = useCallback(async () => {
    try {
      const response = await fetch('/api/gamification/tokens/spending-options');
      if (!response.ok) {
        throw new Error('Failed to fetch spending options');
      }
      const data = await response.json();
      setSpendingOptions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch spending options');
    }
  }, []);

  const earnTokens = useCallback(async (
    amount: number,
    reason: string,
    type: 'earned' | 'bonus' = 'earned',
    metadata: Record<string, any> = {}
  ): Promise<TokenTransaction> => {
    try {
      const response = await fetch('/api/gamification/tokens/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          amount,
          reason,
          type,
          metadata,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to earn tokens');
      }

      const transaction = await response.json();
      
      // Refresh balance and transactions
      await Promise.all([refreshBalance(), refreshTransactions()]);
      
      return transaction;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to earn tokens';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [userId, refreshBalance, refreshTransactions]);

  const spendTokens = useCallback(async (
    amount: number,
    reason: string,
    metadata: Record<string, any> = {}
  ): Promise<TokenTransaction> => {
    try {
      const response = await fetch('/api/gamification/tokens/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          amount: -amount, // Negative for spending
          reason,
          type: 'spent',
          metadata,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to spend tokens');
      }

      const transaction = await response.json();
      
      // Refresh balance and transactions
      await Promise.all([refreshBalance(), refreshTransactions()]);
      
      return transaction;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to spend tokens';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [userId, refreshBalance, refreshTransactions]);

  const purchaseItem = useCallback(async (spendingOptionId: string): Promise<TokenTransaction> => {
    try {
      const response = await fetch('/api/gamification/tokens/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          spendingOptionId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to purchase item');
      }

      const transaction = await response.json();
      
      // Refresh balance and transactions
      await Promise.all([refreshBalance(), refreshTransactions()]);
      
      return transaction;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to purchase item';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [userId, refreshBalance, refreshTransactions]);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        refreshBalance(),
        refreshTransactions(),
        refreshEarningRules(),
        refreshSpendingOptions(),
      ]);
    } catch (err) {
      // Error is already set by individual refresh functions
    } finally {
      setLoading(false);
    }
  }, [refreshBalance, refreshTransactions, refreshEarningRules, refreshSpendingOptions]);

  // Initial load
  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refreshAll();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refreshAll]);

  return {
    // State
    balance,
    transactions,
    earningRules,
    spendingOptions,
    loading,
    error,

    // Actions
    refreshBalance,
    refreshTransactions,
    refreshEarningRules,
    refreshSpendingOptions,
    earnTokens,
    spendTokens,
    purchaseItem,
    refreshAll,
  };
}