"use client";

import { useWallet } from "@crossmint/client-sdk-react-ui";
import { useState, useCallback } from "react";
import { isValidRecipient, isValidAmount } from "@/lib/utils";

interface TransferResult {
  hash: string;
  explorerLink: string;
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

  const handleTransfer = useCallback(async () => {
    if (!wallet || !recipient || !amount) return;
    
    if (!isValidRecipient(recipient)) {
      setError("Please enter a valid ETH address (0x format) or email format");
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
      // Check balance first
      const balanceData = await wallet.balances();
      console.log("Available balances:", balanceData);
      
      // Validate sufficient balance
      const nativeBalance = balanceData.nativeToken?.amount;
      const amountNum = parseFloat(amount.trim());
      
      if (!nativeBalance || parseFloat(nativeBalance) < amountNum) {
        throw new Error("Insufficient balance to complete the transfer.");
      }
      
      // SEI Atlantic 2 Testnet uses ETH as native token
      const result: TransferResult = await wallet.send(recipient.trim(), "eth", amount.trim());
      
      setTxHash(result.hash);
      setExplorerLink(result.explorerLink);
      setSuccess(true);
      
      setRecipient("");
      setAmount("");
    } catch (error) {
      console.error("Transfer failed:", error);
      
      // Enhanced error handling for debugging
      if (error instanceof Error) {
        if (error.message.includes("insufficient balance")) {
          setError("Insufficient balance to complete the transfer.");
        } else if (error.message.includes("Invalid") && error.message.includes("address")) {
          setError("Invalid recipient address format. Please check the address.");
        } else if (error.message.includes("reverted")) {
          setError("Transaction failed. Please ensure you have sufficient ETH testnet tokens. You can get them from the SEI Atlantic 2 faucet.");
        } else {
          setError(`Transfer failed: ${error.message}`);
        }
      } else {
        setError("Transfer failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [wallet, recipient, amount]);

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
        <h3 className="font-medium">Transfer ETH</h3>
        <div className="text-xs text-gray-500">
          Testnet
        </div>
      </div>
      
      {/* Testnet info */}
      <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
        💧 Need testnet ETH? Get free tokens from{" "}
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
      
      <div className="space-y-2">
        <label htmlFor="amount" className="block text-sm text-gray-600">
          Amount (ETH)
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
        disabled={isLoading || !isValidRecipient(recipient) || !isValidAmount(amount)}
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
          "Send ETH"
        )}
      </button>
    </div>
  );
}