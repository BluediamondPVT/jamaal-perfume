'use client';

import { Toaster } from 'sonner';

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      theme="light"
      expand={false}
      duration={3000}
      visibleToasts={4}
    />
  );
}
