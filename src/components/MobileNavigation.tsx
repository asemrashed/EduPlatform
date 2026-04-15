"use client"

import React, { useState } from 'react';
import Link from 'next/link';
import { LuX as X, LuMenu as Menu, LuChevronDown as ChevronDown, LuShoppingBag as ShoppingBag, LuFacebook as Facebook, LuYoutube as Youtube, LuInstagram as Instagram, LuLinkedin as Linkedin } from 'react-icons/lu';
import { useSession, signOut } from 'next-auth/react';

const MobileNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  // Prevent body scroll when menu is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden flex items-center space-x-3">
        <ShoppingBag className="w-5 h-5 text-white hover:text-blue-400 cursor-pointer transition-all duration-300 ease-in-out hover:scale-110" />
        <button 
          onClick={toggleMenu}
          className="text-white hover:text-blue-400 transition-colors duration-300"
          aria-label="Toggle mobile menu"
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] lg:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 animate-in fade-in duration-300"
            onClick={closeMenu}
          />
          
          {/* Menu Panel */}
          <div className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-gray-900 border-l border-gray-700 transform transition-all duration-300 ease-in-out animate-in slide-in-from-right" style={{ backgroundColor: '#111827' }}>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-gray-900" style={{ backgroundColor: '#111827' }}>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                  <div className="absolute w-4 h-4 border border-white/50 rounded-full"></div>
                </div>
                <span className="text-lg font-bold text-white">
                  <span className="text-xl">PHYSICS</span>
                  <span className="text-sm ml-1">WITH TALHA</span>
                </span>
              </div>
              <button 
                onClick={closeMenu}
                className="text-white hover:text-blue-400 transition-colors duration-300"
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 p-6 bg-gray-900" style={{ backgroundColor: '#111827' }}>
              <div className="space-y-6">
                {/* Main Navigation */}
                <div className="space-y-4">
                  <Link 
                    href="/" 
                    onClick={closeMenu}
                    className="block text-lg text-white hover:text-blue-400 font-medium transition-colors duration-300 py-2"
                  >
                    HOME
                  </Link>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-lg text-white hover:text-blue-400 font-medium cursor-pointer py-2">
                      <span>RESOURCES</span>
                      <ChevronDown className="w-5 h-5 transition-transform duration-300" />
                    </div>
                    <div className="ml-4 space-y-2">
                      <Link 
                        href="#" 
                        onClick={closeMenu}
                        className="block text-base text-gray-300 hover:text-blue-400 transition-colors duration-300 py-1"
                      >
                        O Level (GCSE/IGCSE)
                      </Link>
                      <Link 
                        href="#" 
                        onClick={closeMenu}
                        className="block text-base text-gray-300 hover:text-blue-400 transition-colors duration-300 py-1"
                      >
                        AS Level
                      </Link>
                      <Link 
                        href="#" 
                        onClick={closeMenu}
                        className="block text-base text-gray-300 hover:text-blue-400 transition-colors duration-300 py-1"
                      >
                        A2 Level
                      </Link>
                    </div>
                  </div>

                  <Link 
                    href="/register" 
                    onClick={closeMenu}
                    className="block text-lg text-white hover:text-blue-400 font-medium transition-colors duration-300 py-2"
                  >
                    ENROLL
                  </Link>
                  
                  <Link 
                    href="/course" 
                    onClick={closeMenu}
                    className="block text-lg text-white hover:text-blue-400 font-medium transition-colors duration-300 py-2"
                  >
                    COURSES
                  </Link>
                  
                  {!session?.user ? (
                    <>
                      <Link 
                        href="/login" 
                        onClick={closeMenu}
                        className="block text-lg text-white hover:text-blue-400 font-medium transition-colors duration-300 py-2"
                      >
                        LOGIN
                      </Link>
                      
                      <Link 
                        href="/register" 
                        onClick={closeMenu}
                        className="block text-lg text-white hover:text-blue-400 font-medium transition-colors duration-300 py-2"
                      >
                        SIGN UP
                      </Link>
                    </>
                  ) : (
                    <div className="mt-2 p-4 rounded-lg bg-gray-800 border border-gray-700">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center text-white font-semibold">
                          {session.user.image ? (
                            <img src={session.user.image} alt={session.user.name || 'Profile'} className="w-full h-full object-cover" />
                          ) : (
                            <span>{(session.user.name || 'U').charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="text-white font-medium truncate">{session.user.name || 'User'}</div>
                          <div className="text-xs text-gray-400 truncate">{session.user.email || ''}</div>
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <Link 
                          href="/student/dashboard" 
                          onClick={closeMenu}
                          className="block text-center text-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors rounded-md py-2"
                        >
                          Dashboard
                        </Link>
                        <button 
                          onClick={() => { signOut({ callbackUrl: '/' }); closeMenu(); }}
                          className="block text-center text-sm text-white bg-gray-700 hover:bg-gray-600 transition-colors rounded-md py-2"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Social Media Links */}
                <div className="pt-6 border-t border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                    Follow Us
                  </h3>
                  <div className="flex items-center space-x-4">
                    <Facebook className="w-5 h-5 text-white hover:text-blue-400 cursor-pointer transition-all duration-300 ease-in-out hover:scale-110" />
                    <Youtube className="w-5 h-5 text-white hover:text-red-400 cursor-pointer transition-all duration-300 ease-in-out hover:scale-110" />
                    <Instagram className="w-5 h-5 text-white hover:text-pink-400 cursor-pointer transition-all duration-300 ease-in-out hover:scale-110" />
                    <Linkedin className="w-5 h-5 text-white hover:text-blue-400 cursor-pointer transition-all duration-300 ease-in-out hover:scale-110" />
                  </div>
                </div>

                {/* Contact LuInfo */}
                <div className="pt-6 border-t border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                    Contact
                  </h3>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-300">
                      WhatsApp: +8801608181812
                    </p>
                    <p className="text-sm text-gray-300">
                      Email: info@physicswithtalha.com
                    </p>
                  </div>
                </div>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileNavigation;
