import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Crown, Star, Zap } from 'lucide-react';

const TIER_STYLES = {
  free: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    icon: <Shield className="w-4 h-4" />
  },
  pro: {
    bg: 'bg-blue-100',
    text: 'text-blue-800', 
    icon: <Star className="w-4 h-4" />
  },
  enterprise: {
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    icon: <Crown className="w-4 h-4" />
  }
};

function UserTierBadge() {
  const { user } = useAuth();
  const [tier, setTier] = useState<string>('free');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTier = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('subscriptions')
          .select('tier')
          .eq('login_id', user.id)
          .single();

        if (!error && data) {
          setTier(data.tier || 'free');
        }
      } catch (error) {
        console.error('Error fetching tier:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTier();
  }, [user]);

  if (!user || loading) {
    return (
      <div className="animate-pulse h-6 w-20 bg-gray-200 rounded-full" />
    );
  }

  const currentTier = tier.toLowerCase() as keyof typeof TIER_STYLES;
  const tierStyle = TIER_STYLES[currentTier] || TIER_STYLES.free;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${tierStyle.bg} ${tierStyle.text}`}>
      {tierStyle.icon}
      <span className="capitalize">{tier}</span>
    </div>
  );
}

export default UserTierBadge;
