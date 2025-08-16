"use client";

import { useWallet } from "@crossmint/client-sdk-react-ui";
import { useState, useCallback, useEffect } from "react";
import { isValidRecipient, isValidAmount } from "@/lib/utils";

interface ComponentTokenBalance {
  symbol: string;
  name: string;
  amount: string;
}

export function Transfer() {
  const { wallet, status } = useWallet();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [explorerLink, setExplorerLink] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [selectedToken, setSelectedToken] = useState("");
  const [availableTokens, setAvailableTokens] = useState<ComponentTokenBalance[]>([]);

  const handleTransfer = useCallback(async () => {
    if (!wallet || !recipient || !amount) return;
    
    if (!isValidRecipient(recipient)) {
      setError("Please enter a valid address (0x format) or email format");
      return;
    }
    
    if (!isValidAmount(amount)) {
      setError("Amount must be a positive number with up to 6 decimal places");
      return;
    }
    
    setError("");
    setSuccess(false);
    setTxHash("");
    setExplorerLink("");
    
    setIsLoading(true);
    try {
      if (!selectedToken) {
        throw new Error("Please select a token to transfer.");
      }
      
      const selectedTokenData = availableTokens.find(t => t.symbol === selectedToken);
      const amountNum = parseFloat(amount.trim());
      const tokenBalance = selectedTokenData ? parseFloat(selectedTokenData.amount) : 0;
      
      if (tokenBalance < amountNum) {
        throw new Error(`Insufficient ${selectedToken.toUpperCase()} balance. Available: ${tokenBalance}, Required: ${amountNum}`);
      }
      
      // Get wallet address for API call
      const walletAddress = wallet.address;
      
      // Create proper token locator for API
      const tokenSymbol = selectedToken.toLowerCase();
      let tokenLocator: string;
      
      if (tokenSymbol === 'sei') {
        tokenLocator = 'sei-atlantic-2-testnet:sei';
      } else if (tokenSymbol === 'eth') {
        tokenLocator = 'sei-atlantic-2-testnet:eth';
      } else if (tokenSymbol === 'usdc') {
        tokenLocator = 'sei-atlantic-2-testnet:usdc';
      } else if (tokenSymbol === 'usdt') {
        tokenLocator = 'sei-atlantic-2-testnet:usdt';
      } else {
        tokenLocator = `sei-atlantic-2-testnet:${tokenSymbol}`;
      }
      
      console.log(`Attempting transfer via API: ${amount} ${tokenLocator} to ${recipient}`);
      
      // Call our Next.js API endpoint
      const response = await fetch('/api/wallet/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletLocator: walletAddress,
          tokenLocator: tokenLocator,
          recipient: recipient.trim(),
          amount: amount.trim()
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Transfer failed');
      }
      
      // Extract transaction info from Crossmint API response
      setTxHash(result.onChain?.txId || result.id);
      setExplorerLink(result.onChain?.explorerLink || '');
      setSuccess(true);
      
      setRecipient("");
      setAmount("");
    } catch (error) {
      console.error("Transfer failed:", error);
      
      if (error instanceof Error) {
        if (error.message.includes("insufficient balance")) {
          setError("Insufficient balance to complete the transfer.");
        } else if (error.message.includes("Invalid token address or currency symbol")) {
          setError("Invalid token format. Please try again or contact support if the issue persists.");
        } else if (error.message.includes("Invalid") && error.message.includes("address")) {
          setError("Invalid recipient address format. Please check the address.");
        } else if (error.message.includes("reverted") || error.message.includes("execution_reverted")) {
          setError("Transaction reverted. This usually means insufficient balance, invalid address, or network issues. Please verify your recipient address and amount.");
        } else if (error.message.includes("build_failed")) {
          setError("Transaction failed to build. Please check your inputs and try again.");
        } else if (error.message.includes("sanctioned_wallet_address")) {
          setError("Cannot transfer to this address due to compliance restrictions.");
        } else {
          setError(`Transfer failed: ${error.message}`);
        }
      } else {
        setError("Transfer failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [wallet, recipient, amount, selectedToken, availableTokens]);

  // Load tokens using our API
  useEffect(() => {
    const loadTokens = async () => {
      if (!wallet || status !== "loaded") return;
      
      try {
        console.log('🔍 Loading tokens via API...');
        const response = await fetch(`/api/wallet/balance?walletLocator=${wallet.address}`);
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const apiTokens = await response.json();
        console.log('✅ Received tokens from API:', apiTokens);
        
        const tokens: ComponentTokenBalance[] = [];
        
        // Process API response and extract tokens with balance > 0
        if (Array.isArray(apiTokens)) {
          apiTokens.forEach((tokenData: { amount: string; symbol: string }) => {
            if (tokenData.amount && parseFloat(tokenData.amount) > 0) {
              tokens.push({
                symbol: tokenData.symbol,
                name: tokenData.symbol.toUpperCase(),
                amount: tokenData.amount
              });
            }
          });
        }
        
        console.log('🎯 Processed tokens:', tokens);
        setAvailableTokens(tokens);
        
        if (tokens.length > 0 && !selectedToken) {
          setSelectedToken(tokens[0].symbol);
        }
      } catch (error) {
        console.error("❌ Failed to load tokens via API:", error);
      }
    };
    
    loadTokens();
  }, [wallet, status, selectedToken]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^[0-9]*\.?[0-9]{0,6}$/.test(value)) {
      if (!value.match(/^0[0-9]/)) {
        setAmount(value);
      }
    }
  };

  if (status === "in-progress") {
    return (
      <div className="p-4 border rounded text-sm text-gray-500 animate-pulse">
        Loading wallet...
      </div>
    );
  }

  if (!wallet) {
    return <div className="p-4 border rounded text-sm text-gray-500">No wallet available</div>;
  }

  return (
    <div className="space-y-3 p-4 border rounded">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Transfer Tokens</h3>
        <div className="text-xs text-gray-500">
          Testnet
        </div>
      </div>
      
      <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
        💧 Need testnet tokens? Get free ETH/tokens from{" "}
        <a 
          href="https://docs.sei.io/learn/faucet" 
          target="_blank" 
          rel="noopener noreferrer"
          className="underline hover:text-blue-800"
        >
          SEI Faucet
        </a>
      </div>
      
      <div className="space-y-2">
        <label htmlFor="recipient" className="block text-sm text-gray-600">
          Recipient Address
        </label>
        <input
          id="recipient"
          type="text"
          placeholder="0xf90F618eD1243a35898e89DCDeA26664aBd74F62"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value.trim())}
          className="w-full p-2 border rounded text-sm font-mono"
          disabled={isLoading}
          autoComplete="off"
          spellCheck={false}
        />
      </div>
      
      {availableTokens.length > 0 && (
        <div className="space-y-2">
          <label htmlFor="token" className="block text-sm text-gray-600">
            Token to Send
          </label>
          <select
            id="token"
            value={selectedToken}
            onChange={(e) => setSelectedToken(e.target.value)}
            className="w-full p-2 border rounded text-sm"
            disabled={isLoading}
          >
            {availableTokens.map((token) => (
              <option key={token.symbol} value={token.symbol}>
                {token.symbol.toUpperCase()} - {token.amount} available
              </option>
            ))}
          </select>
        </div>
      )}
      
      <div className="space-y-2">
        <label htmlFor="amount" className="block text-sm text-gray-600">
          Amount
        </label>
        <input
          id="amount"
          type="text"
          placeholder="0.001"
          value={amount}
          onChange={handleAmountChange}
          className="w-full p-2 border rounded text-sm"
          disabled={isLoading}
          autoComplete="off"
          inputMode="decimal"
        />
      </div>
      
      {error && (
        <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
          {error}
        </div>
      )}
      
      {success && txHash && (
        <div className="p-2 bg-green-50 border border-green-200 rounded text-sm">
          <div className="text-green-600 font-medium mb-1">Transfer successful!</div>
          <div className="text-xs text-gray-600 break-all">
            <span className="font-medium">Tx Hash:</span> {txHash}
          </div>
          {explorerLink && (
            <a
              href={explorerLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline mt-1 inline-block"
            >
              View on Explorer →
            </a>
          )}
        </div>
      )}
      
      <button
        onClick={handleTransfer}
        disabled={isLoading || !isValidRecipient(recipient) || !isValidAmount(amount) || !selectedToken}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Sending...
          </span>
        ) : (
          `Send ${selectedToken ? selectedToken.toUpperCase() : 'Tokens'}`
        )}
      </button>
    </div>
  );
}