'use client';

import { useAppSelector } from '@/lib/hooks';
import { useSession } from 'next-auth/react';

export default function DebugAuth() {
  const { user, isAuthenticated, isLoading, error } = useAppSelector((state) => state.auth);
  const { data: session, status } = useSession();

  return (
    <div className="fixed bottom-4 left-4 bg-black text-white p-4 rounded-lg text-xs max-w-md">
      <h3 className="font-bold mb-2">Debug Info:</h3>
      <div className="space-y-1">
        <div>Redux Auth: {isAuthenticated ? '✅' : '❌'}</div>
        <div>Redux User: {user ? user.email : 'None'}</div>
        <div>Redux Loading: {isLoading ? '⏳' : '✅'}</div>
        <div>Redux Error: {error || 'None'}</div>
        <div>NextAuth Status: {status}</div>
        <div>NextAuth Session: {session ? '✅' : '❌'}</div>
        {session && (
          <div>NextAuth User: {session.user?.email}</div>
        )}
      </div>
    </div>
  );
}
