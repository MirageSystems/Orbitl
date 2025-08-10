"use client";

import {
  CrossmintProvider,
  CrossmintAuthProvider,
  CrossmintWalletProvider,
} from "@crossmint/client-sdk-react-ui";
import { env } from "@/lib/env";
import type { ReactNode } from "react";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <CrossmintProvider apiKey={env.NEXT_PUBLIC_CROSSMINT_API_KEY}>
      <CrossmintAuthProvider
        authModalTitle={"Orbitl"}
        loginMethods={["google", "email"]}
      >
        <CrossmintWalletProvider
          createOnLogin={{
            chain: "sei-atlantic-2-testnet",
            signer: {
              type: "email",
            },
          }}
        >
          {children}
        </CrossmintWalletProvider>
      </CrossmintAuthProvider>
    </CrossmintProvider>
  );
}
