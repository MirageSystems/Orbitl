"use client";

import { useWallet } from "@crossmint/client-sdk-react-ui";
import { formatAddress, copyToClipboard, cn } from "@/lib/utils";
import { useState } from "react";

export function Wallet() {
  const { wallet, status } = useWallet();
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = async () => {
    if (!wallet?.address) return;

    try {
      await copyToClipboard(wallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy address:", error);
    }
  };

  if (status === "in-progress") {
    return (
      <div className="p-3 border rounded text-sm text-gray-500 animate-pulse">
        Loading wallet...
      </div>
    );
  }

  if (status === "loaded" && wallet) {
    return (
      <div className="p-3 border rounded space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">Wallet Connected</div>
          {/* {isTestnet() && ( */}
          <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">
            Testnet
          </span>
          {/* )} */}
        </div>
        <button
          onClick={handleCopyAddress}
          className={cn(
            "text-xs font-mono break-all text-left hover:text-blue-600 transition-colors",
            "p-2 bg-gray-50 rounded border w-full"
          )}
          title="Click to copy address"
        >
          {formatAddress(wallet.address, 6)}
          {copied && <span className="ml-2 text-green-600">Copied!</span>}
        </button>
      </div>
    );
  }

  return (
    <div className="p-3 border rounded text-sm text-gray-500">
      Wallet not connected
    </div>
  );
}