import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { UserSubscription, SubscriptionPlan } from '../types';
import { PLAN_CONFIGS } from '../types';
import { useAuth } from './AuthContext';
import { getActiveSubscription } from '../services/subscriptionService';

interface SubscriptionContextValue {
  subscription: UserSubscription | null;
  plan: SubscriptionPlan;
  loading: boolean;
  tokensRemaining: number;
  canUsePlatformKey: boolean;
  canExportPptx: boolean;
  maxSlides: number;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSubscription = useCallback(async () => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }
    try {
      const sub = await getActiveSubscription();
      setSubscription(sub);
    } catch {
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    setLoading(true);
    refreshSubscription();
  }, [refreshSubscription]);

  const plan: SubscriptionPlan = subscription?.plan || 'free';
  const config = PLAN_CONFIGS[plan];

  return (
    <SubscriptionContext.Provider value={{
      subscription,
      plan,
      loading,
      tokensRemaining: subscription?.tokensRemaining ?? 0,
      canUsePlatformKey: config.canUsePlatformKey,
      canExportPptx: config.canExportPptx,
      maxSlides: config.maxSlides,
      refreshSubscription,
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscription must be used within SubscriptionProvider');
  return ctx;
};
