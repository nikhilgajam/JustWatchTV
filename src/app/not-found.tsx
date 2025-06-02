'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This component handles the 404 Not Found page by redirecting to the home page
export default function NotFound() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/');
  }, [router]);
  
  return null; // No UI needed as we're redirecting
}
