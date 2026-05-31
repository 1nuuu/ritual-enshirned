'use client';

import { LazyMotion, domAnimation } from 'framer-motion';
import * as m from 'framer-motion/m';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { Footer } from './Footer';
import { Header } from './Header';

const CustomCursor = dynamic(() => import('./CustomCursor').then((mod) => ({ default: mod.CustomCursor })), {
  ssr: false,
});
const AppToaster = dynamic(() => import('./AppToaster').then((mod) => ({ default: mod.AppToaster })), {
  ssr: false,
});

export function AppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <>
      <Header />
      <LazyMotion features={domAnimation}>
        <m.div
          key={pathname}
          className="pb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.18 }}
        >
          {children}
        </m.div>
      </LazyMotion>
      <Footer />
      <CustomCursor />
      <AppToaster />
    </>
  );
}
