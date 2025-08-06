"use client";

import { useWallet } from "@crossmint/client-sdk-react-ui";
import { useEffect, useState, useCallback } from "react";
import { formatBalance, cn } from "@/lib/utils";

interface TokenBalance {
  amount: string;
  symbol: string;
  decimals?: number;
}

interface WalletBalances {
  nativeToken?: TokenBalance;
  usdc?: TokenBalance;
  tokens?: TokenBalance[];
}

export function Balance() {
  const { wallet, status } = useWallet();
  const [balances, setBalances] = useState<WalletBalances | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalances = useCallback(async () => {
    if (!wallet) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const balanceData = await wallet.balances(["USDC"]);
      setBalances(balanceData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch balances";
      setError(errorMessage);
      console.error("Error fetching balances:", err);
    } finally {
      setLoading(false);
    }
  }, [wallet]);

  useEffect(() => {
    if (wallet && status === "loaded") {
      fetchBalances();
    }
  }, [wallet, status, fetchBalances]);

  if (status === "in-progress") {
    return (
      <div className="text-sm text-gray-500 p-3 border rounded animate-pulse">
        Loading wallet...
      </div>
    );
  }

  if (!wallet) {
    return (
      <div className="text-sm text-gray-500 p-3 border rounded">
        No wallet available
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-3 border rounded animate-pulse">
        <div className="text-sm text-gray-500">Loading balances...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3 border rounded border-red-200 bg-red-50">
        <div className="text-sm text-red-600 mb-2">Error: {error}</div>
        <button 
          onClick={fetchBalances}
          className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!balances) {
    return (
      <div className="p-3 border rounded">
        <button 
          onClick={fetchBalances}
          className={cn(
            "px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700",
            "transition-colors disabled:opacity-50"
          )}
          disabled={loading}
        >
          Load Balances
        </button>
      </div>
    );
  }

  const hasBalances = balances.nativeToken || balances.usdc || (balances.tokens && balances.tokens.length > 0);

  if (!hasBalances) {
    return (
      <div className="p-3 border rounded">
        <div className="text-sm text-gray-500 mb-2">No balances found</div>
        <button 
          onClick={fetchBalances}
          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="p-3 border rounded space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">Balances</div>
        <button 
          onClick={fetchBalances}
          className="text-xs text-blue-600 hover:text-blue-800"
          disabled={loading}
        >
          Refresh
        </button>
      </div>
      
      <div className="space-y-2 text-sm">
        {balances.nativeToken && (
          <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
            <span className="font-medium">SEI</span>
            <span>{formatBalance(balances.nativeToken.amount)} {balances.nativeToken.symbol}</span>
          </div>
        )}
        
        {balances.usdc && (
          <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
            <span className="font-medium">USDC</span>
            <span>{formatBalance(balances.usdc.amount)} {balances.usdc.symbol}</span>
          </div>
        )}
        
        {balances.tokens?.map((token, i) => (
          <div key={i} className="flex justify-between items-center p-2 bg-gray-50 rounded">
            <span className="font-medium">{token.symbol}</span>
            <span>{formatBalance(token.amount)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}