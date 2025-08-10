"use client";

import { useWallet } from "@crossmint/client-sdk-react-ui";
import { useState } from "react";

export function Transfer() {
  const { wallet, status } = useWallet();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleTransfer = async () => {
    if (!wallet || !recipient || !amount) return;
    
    setIsLoading(true);
    try {
      // Transfer logic would go here
      console.log("Transfer:", { recipient, amount });
    } catch (error) {
      console.error("Transfer failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!wallet) {
    return <div className="text-sm text-gray-500">No wallet available</div>;
  }

  return (
    <div className="space-y-3 p-4 border rounded">
      <h3 className="font-medium">Transfer SEI</h3>
      
      <input
        type="text"
        placeholder="Recipient address"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
        className="w-full p-2 border rounded text-sm"
      />
      
      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full p-2 border rounded text-sm"
        step="0.001"
      />
      
      <button
        onClick={handleTransfer}
        disabled={isLoading || !recipient || !amount}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? "Sending..." : "Send"}
      </button>
    </div>
  );
}