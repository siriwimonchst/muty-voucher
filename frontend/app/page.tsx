'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/home');
    } else {
      router.push('/login');
    }
  }, [router]);

  return null; // Layout handles the splash screen/loading state
}


