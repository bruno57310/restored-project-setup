import React from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const SubscriptionManager = () => {
  const { user, fetchSubscriptions } = useAuth();
  const isAdmin = user?.email === 'bruno_wendling@orange.fr';

  const forceEnterpriseTier = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('subscriptions')
        .upsert({
          login_id: user.id,
          tier: 'enterprise',
          active: true,
          current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        }, {
          onConflict: 'login_id'
        });

      if (error) throw error;
      await fetchSubscriptions();
      alert('Tier enterprise forcé avec succès');
    } catch (err) {
      console.error('Erreur lors du upsert:', err);
      alert('Échec de la mise à jour');
    }
  };

  return (
    <>
      {isAdmin && (
        <button
          onClick={forceEnterpriseTier}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500"
        >
          Forcer Tier Enterprise
        </button>
      )}
    </>
  );
};

export default SubscriptionManager;
