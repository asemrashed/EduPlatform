"use client"

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function HeaderAuth() {
  const { data: session } = useSession();

  if (!session?.user) {
    return (
      <div className="flex items-center space-x-3">
        <Link href="/login" className="text-sm xl:text-base text-white hover:text-blue-400 font-medium transition-all duration-300 ease-in-out hover:scale-105">LOGIN</Link>
        <Link href="/register" className="text-sm xl:text-base text-white hover:text-blue-400 font-medium transition-all duration-300 ease-in-out hover:scale-105">SIGN UP</Link>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      <Link href="/student/dashboard" className="text-sm xl:text-base text-white hover:text-blue-400 font-medium transition-all duration-300 ease-in-out hover:scale-105">DASHBOARD</Link>
      <button
        onClick={() => signOut({ callbackUrl: '/' })}
        className="text-sm xl:text-base text-white/90 hover:text-red-300 font-medium transition-all duration-300 ease-in-out hover:scale-105"
      >
        LOGOUT
      </button>
      <div className="w-8 h-8 rounded-full overflow-hidden bg-white/20 flex items-center justify-center">
        {session.user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={session.user.image} alt={session.user.name || 'Profile'} className="w-full h-full object-cover" />
        ) : (
          <span className="text-white text-sm font-semibold">{(session.user.name || 'U').charAt(0).toUpperCase()}</span>
        )}
      </div>
    </div>
  );
}


