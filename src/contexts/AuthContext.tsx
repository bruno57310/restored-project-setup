// Ajout de logs de debug
useEffect(() => {
  console.log('🔄 Auth state changed - user:', user?.email);
  if (user) {
    console.log('🔍 Fetching tier for:', user.email);
    const fetchTier = async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('tier')
        .eq('login_id', user.id)
        .single();
      
      console.log('📦 Tier fetch result:', { data, error });
      setSubscriptionTier(data?.tier || null);
    };
    fetchTier();
  }
}, [user]);
