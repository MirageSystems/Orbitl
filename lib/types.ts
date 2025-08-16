export interface ChainBalance {
  locator: string;
  amount: string;
  rawAmount: string;
  contractAddress?: string;
}

export interface TokenBalance {
  symbol: string;
  decimals: number;
  amount: string;
  rawAmount: string;
  chains: Record<string, ChainBalance>;
}

export interface TransferRequest {
  walletLocator: string;
  tokenLocator: string;
  recipient: string;
  amount: string;
  memo?: string;
}

export interface TransferResponse {
  id: string;
  status: string;
  onChain?: {
    txId?: string;
    explorerLink?: string;
  };
}

export interface ApiErrorResponse {
  error: string;
  status?: number;
}

export interface WalletBalances {
  nativeToken?: {
    amount: string;
    symbol: string;
    name: string;
    decimals?: number;
  };
  usdc?: {
    amount: string;
    symbol: string;
    decimals?: number;
  };
  tokens?: {
    amount: string;
    symbol: string;
    decimals?: number;
  }[];
}