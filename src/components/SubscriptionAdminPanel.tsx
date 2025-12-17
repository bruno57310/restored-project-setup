import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Home, 
  User, 
  Users, 
  Calendar, 
  DollarSign, 
  AlertCircle, 
  CheckCircle, 
  RefreshCw,
  Edit,
  X,
  Download,
  Search,
  Filter,
  Shield
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Subscription, SubscriptionTier } from '../types/subscription';

const TIER_COLORS = {
  free: 'bg-gray-100 text-gray-800',
  pro: 'bg-blue-100 text-blue-800',
  enterprise: 'bg-purple-100 text-purple-800'
};

function SubscriptionAdminPanel() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState<SubscriptionTier | ''>('');
  const { user } = useAuth();

  const isAdmin = user?.email === 'bruno_wendling@orange.fr';

  useEffect(() => {
    if (isAdmin) {
      fetchSubscriptions();
    }
  }, [isAdmin]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .order('current_period_end', { ascending: false });

      if (error) throw error;
      
      setSubscriptions(data || []);
    } catch (err) {
      console.error('Error fetching subscriptions:', err);
      setError('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const updateSubscriptionTier = async (subscriptionId: string, newTier: SubscriptionTier) => {
    if (!confirm('Confirm tier change?')) return;

    try {
      setError(null);
      setSuccess(null);

      const { error } = await supabase
        .from('subscriptions')
        .update({ tier: newTier })
        .eq('id', subscriptionId);

      if (error) throw error;
      
      setSubscriptions(prev => 
        prev.map(sub => 
          sub.id === subscriptionId 
            ? { ...sub, tier: newTier }
            : sub
        )
      );
      setSuccess('Tier updated successfully');
    } catch (err) {
      console.error('Error updating tier:', err);
      setError('Failed to update tier');
    }
  };

  const exportSubscriptionsCSV = () => {
    if (subscriptions.length === 0) return;
    
    const headers = [
      'User ID',
      'Tier',
      'Status',
      'Start Date',
      'End Date',
      'Auto Renew'
    ].join(',');
    
    const rows = subscriptions.map(sub => [
      sub.user_id,
      sub.tier,
      sub.active ? 'Active' : 'Inactive',
      new Date(sub.current_period_start).toISOString().split('T')[0],
      new Date(sub.current_period_end).toISOString().split('T')[0],
      !sub.cancel_at_period_end
    ].join(','));
    
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `subscriptions_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = sub.user_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = !tierFilter || sub.tier === tierFilter;
    return matchesSearch && matchesTier;
  });

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          <h2 className="text-xl font-bold mb-2">Admin Access Required</h2>
          <p className="mb-4">This panel is restricted to administrators.</p>
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Home className="w-4 h-4 mr-2" />
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link
          to="/dashboard"
          className="bg-green-700 text-white p-2 rounded-lg hover:bg-green-600 transition-colors"
          title="Return to dashboard"
        >
          <Home className="w-5 h-5" />
        </Link>
        <h1 className="text-3xl font-bold text-green-800">
          Subscription Management
        </h1>
        <span className="flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-800 rounded-full">
          <Shield className="w-4 h-4" />
          Admin Mode
        </span>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          {success}
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by user ID..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value as SubscriptionTier || '')}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="">All Tiers</option>
          <option value="free">Free</option>
          <option value="pro">Pro</option>
          <option value="enterprise">Enterprise</option>
        </select>
        <button
          onClick={fetchSubscriptions}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
        <button
          onClick={exportSubscriptionsCSV}
          className="flex items-center gap-2 px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-600"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">User ID</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Tier</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Period End</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredSubscriptions.map((subscription) => (
              <tr key={subscription.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <span className="font-mono text-sm">{subscription.user_id}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${TIER_COLORS[subscription.tier]}`}>
                    {subscription.tier}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {subscription.active ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Inactive
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>
                      {new Date(subscription.current_period_end).toLocaleDateString()}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <select
                      value={subscription.tier}
                      onChange={(e) => updateSubscriptionTier(subscription.id, e.target.value as SubscriptionTier)}
                      className="px-2 py-1 border rounded-lg bg-white"
                    >
                      <option value="free">Free</option>
                      <option value="pro">Pro</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </div>
                </td>
              </tr>
            ))}
            {filteredSubscriptions.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No subscriptions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SubscriptionAdminPanel;
