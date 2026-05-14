'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function SplashProvider({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);
  const [renderChildren, setRenderChildren] = useState(false);

  useEffect(() => {
    // Show splash for 2 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
      // Short delay before showing children to ensure smooth transition
      const renderTimer = setTimeout(() => {
        setRenderChildren(true);
      }, 500);
      return () => clearTimeout(renderTimer);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {showSplash ? (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white transition-opacity duration-500">
          <div className="relative w-full h-screen">
            <Image
              src="/assets/muty_splash.png"
              alt="Muty Splash"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
      ) : (
        <div className={renderChildren ? 'opacity-100' : 'opacity-0'}>
          {children}
        </div>
      )}
    </>
  );
}
