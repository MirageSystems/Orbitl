import { AuthButton } from "@/components/login";
import { Wallet } from "@/components/wallet";
import { Balance } from "@/components/balance";
import { Transfer } from "@/components/transfer";

export default function Home() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-md mx-auto mt-20 space-y-6">
        <h1 className="text-2xl font-bold text-center">Orbitl</h1>
        
        <AuthButton />
        
        <Wallet />
        
        <Balance />
        
        <Transfer />
      </div>
    </div>
  );
}
