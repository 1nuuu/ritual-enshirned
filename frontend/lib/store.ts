import { create } from 'zustand';
import type { TierKey } from './tiers';

interface UIState {
  pendingPullTier: TierKey | null;
  setPendingPullTier: (tier: TierKey | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  pendingPullTier: null,
  setPendingPullTier: (tier) => set({ pendingPullTier: tier }),
}));
