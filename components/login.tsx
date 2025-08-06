"use client";

import { useAuth } from "@crossmint/client-sdk-react-ui";
import { cn } from "@/lib/utils";

const buttonBaseStyles = "px-4 py-2 rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
const primaryButtonStyles = "bg-blue-600 text-white hover:bg-blue-700";
const secondaryButtonStyles = "bg-gray-600 text-white hover:bg-gray-700";

export function AuthButton() {
  const { login, logout, jwt } = useAuth();

  if (!jwt) {
    return (
      <button 
        type="button" 
        onClick={login}
        className={cn(buttonBaseStyles, primaryButtonStyles)}
        aria-label="Login to your account"
      >
        Login
      </button>
    );
  }

  return (
    <button 
      type="button" 
      onClick={logout}
      className={cn(buttonBaseStyles, secondaryButtonStyles)}
      aria-label="Logout from your account"
    >
      Logout
    </button>
  );
}
