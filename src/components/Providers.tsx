"use client";

import { useEffect } from "react";
import { SessionProvider } from "next-auth/react";
import { Provider, useDispatch } from "react-redux";
import { store } from "@/store/store";
import { checkAuthStatus } from "@/store/slices/authSlice";

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();

  useEffect(() => {
    // Initialize auth state from NextAuth session on app mount
    dispatch(checkAuthStatus() as any);
  }, [dispatch]);

  return <>{children}</>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <SessionProvider>
        <AuthInitializer>{children}</AuthInitializer>
      </SessionProvider>
    </Provider>
  );
}
