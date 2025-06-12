'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

function AccessDeniedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');

  useEffect(() => {
    // Redirect to home page after 5 seconds
    const timer = setTimeout(() => {
      router.push('/');
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  const getMessage = () => {
    switch (reason) {
      case 'unauthorized':
        return 'You do not have permission to access this page.';
      default:
        return 'Access denied. You do not have permission to view this page.';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <AlertCircle className="h-6 w-6 text-red-600" />
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Access Denied
        </h1>
        <p className="mt-6 text-base leading-7 text-gray-600">
          {getMessage()}
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button
            onClick={() => router.push('/')}
            className="rounded-md bg-red-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
          >
            Go back home
          </Button>
          <Button
            onClick={() => router.push('/contact-support')}
            variant="ghost"
            className="text-sm font-semibold text-gray-900 hover:text-gray-700"
          >
            Contact support <span aria-hidden="true">&rarr;</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AccessDenied() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="animate-pulse">Loading...</div>
      </div>
    }>
      <AccessDeniedContent />
    </Suspense>
  );
}
