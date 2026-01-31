'use client';

import { usePathname } from 'next/navigation';
import { Header } from './Header';
import { Footer } from './Footer';

export function LayoutWrapper() {
  const pathname = usePathname();
  
  // Don't show header/footer on admin routes
  const isAdminRoute = pathname?.startsWith('/admin') || pathname?.startsWith('/(admin)');
  
  if (isAdminRoute) {
    return null;
  }
  
  return (
    <>
      <Header />
      {/* Footer will be rendered separately after main */}
    </>
  );
}

export function FooterWrapper() {
  const pathname = usePathname();
  
  // Don't show footer on admin routes
  const isAdminRoute = pathname?.startsWith('/admin') || pathname?.startsWith('/(admin)');
  
  if (isAdminRoute) {
    return null;
  }
  
  return <Footer />;
}
