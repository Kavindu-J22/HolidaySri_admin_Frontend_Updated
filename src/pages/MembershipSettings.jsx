import React, { useState, useEffect } from 'react';
import { 
  Users, 
  DollarSign, 
  Calendar, 
  TrendingUp, 
  Save, 
  Loader, 
  AlertCircle,
  CheckCircle,
  Crown,
  Star,
  Settings
} from 'lucide-react';
import { adminAPI } from '../config/api';

const MembershipSettings = () => {
  const [config, setConfig] = useState({
    monthlyCharge: 2500,
    yearlyCharge: 25000,
    features: []
  });
  const [stats, setStats] = useState({
    totalMembers: 0,
    monthlyMembers: 0,
    yearlyMembers: 0,
    revenue: {
      monthly: { count: 0, totalRevenue: 0 },
      yearly: { count: 0, totalRevenue: 0 }
    },
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [newFeature, setNewFeature] = useState('');

  useEffect(() => {
    fetchMembershipData();
  }, []);

  const fetchMembershipData = async () => {
    try {
      setLoading(true);

      // Test admin authentication first
      console.log('Testing admin authentication...');
      try {
        const testResponse = await adminAPI.getMembershipTest();
        console.log('Admin test response:', testResponse.data);
      } catch (testError) {
        console.error('Admin test failed:', testError);
      }

      console.log('Fetching membership data...');
      const [configResponse, statsResponse] = await Promise.all([
        adminAPI.getMembershipConfig(),
        adminAPI.getMembershipStats()
      ]);

      console.log('Config response:', configResponse.data);
      console.log('Stats response:', statsResponse.data);

      if (configResponse.data.success) {
        setConfig(configResponse.data.config);
      }

      if (statsResponse.data.success) {
        setStats(statsResponse.data.stats);
      }
    } catch (error) {
      console.error('Error fetching membership data:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load membership data';
      setMessage({ type: 'error', text: `Failed to load membership data: ${errorMessage}` });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    try {
      setSaving(true);
      setMessage({ type: '', text: '' });

      const response = await adminAPI.updateMembershipConfig({
        monthlyCharge: parseFloat(config.monthlyCharge),
        yearlyCharge: parseFloat(config.yearlyCharge),
        features: config.features
      });

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Membership configuration updated successfully!' });
        setConfig(response.data.config);
      }
    } catch (error) {
      console.error('Error updating membership config:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update membership configuration';
      setMessage({ type: 'error', text: `Failed to update membership configuration: ${errorMessage}` });
    } finally {
      setSaving(false);
    }
  };

  const addFeature = () => {
    if (newFeature.trim() && !config.features.includes(newFeature.trim())) {
      setConfig(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const removeFeature = (index) => {
    setConfig(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Membership Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage Holidaysri membership pricing and features
          </p>
        </div>
        <Crown className="w-8 h-8 text-yellow-500" />
      </div>

      {/* Message */}
      {message.text && (
        <div className={`p-4 rounded-lg flex items-center space-x-2 ${
          message.type === 'success' 
            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' 
            : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Members
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalMembers}
              </p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Monthly Members
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.monthlyMembers}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Yearly Members
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.yearlyMembers}
              </p>
            </div>
            <Star className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Revenue
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalRevenue.toLocaleString()} LKR
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Configuration Form */}
      <div className="card p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Pricing Configuration
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Monthly Charge (LKR)
            </label>
            <input
              type="number"
              value={config.monthlyCharge}
              onChange={(e) => setConfig(prev => ({ ...prev, monthlyCharge: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              min="0"
              step="100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Yearly Charge (LKR)
            </label>
            <input
              type="number"
              value={config.yearlyCharge}
              onChange={(e) => setConfig(prev => ({ ...prev, yearlyCharge: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              min="0"
              step="100"
            />
          </div>
        </div>

        {/* Features Management */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Membership Features
          </label>
          
          <div className="flex space-x-2 mb-4">
            <input
              type="text"
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              placeholder="Add new feature..."
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              onKeyPress={(e) => e.key === 'Enter' && addFeature()}
            />
            <button
              onClick={addFeature}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
            >
              Add
            </button>
          </div>

          <div className="space-y-2">
            {config.features.map((feature, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-gray-900 dark:text-white">{feature}</span>
                <button
                  onClick={() => removeFeature(index)}
                  className="text-red-600 hover:text-red-700 transition-colors duration-200"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSaveConfig}
            disabled={saving}
            className="flex items-center space-x-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {saving ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MembershipSettings;
