import { AppFrame } from '@/components/AppFrame';
import { Providers } from '../providers';

export default function CollectionLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <AppFrame>{children}</AppFrame>
    </Providers>
  );
}
