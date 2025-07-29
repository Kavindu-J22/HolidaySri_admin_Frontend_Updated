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
  Settings,
  Eye,
  ArrowLeft
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
  const [showTransactions, setShowTransactions] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [transactionsPagination, setTransactionsPagination] = useState({
    current: 1,
    pages: 1,
    total: 0
  });

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

  const fetchMembershipTransactions = async (page = 1) => {
    try {
      setTransactionsLoading(true);
      const response = await adminAPI.getMembershipTransactions({ page, limit: 10 });

      if (response.data.success) {
        setTransactions(response.data.transactions);
        setTransactionsPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching membership transactions:', error);
      setMessage({ type: 'error', text: 'Failed to load membership transactions' });
    } finally {
      setTransactionsLoading(false);
    }
  };

  const handleViewTransactions = () => {
    setShowTransactions(true);
    fetchMembershipTransactions();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  // If viewing transactions, show transactions view
  if (showTransactions) {
    return (
      <div className="space-y-6">
        {/* Transactions Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowTransactions(false)}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Settings</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Membership Transactions
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                View all membership purchase transactions
              </p>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="card overflow-hidden">
          {transactionsLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader className="w-8 h-8 animate-spin text-primary-600" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Plan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        HSC Used
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Expires
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {transactions.map((transaction) => (
                      <tr key={transaction._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {transaction.userId?.name || 'Unknown User'}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {transaction.userId?.email || 'No email'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            transaction.membershipType === 'yearly'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                          }`}>
                            {transaction.membershipType?.charAt(0).toUpperCase() + transaction.membershipType?.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {transaction.amount?.toLocaleString()} LKR
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {transaction.hscAmount} HSC
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            transaction.status === 'active'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                              : transaction.status === 'expired'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                          }`}>
                            {transaction.status?.charAt(0).toUpperCase() + transaction.status?.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(transaction.expirationDate).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {transactionsPagination.pages > 1 && (
                <div className="bg-white dark:bg-gray-900 px-4 py-3 border-t border-gray-200 dark:border-gray-700 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 flex justify-between sm:hidden">
                      <button
                        onClick={() => fetchMembershipTransactions(transactionsPagination.current - 1)}
                        disabled={transactionsPagination.current === 1}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => fetchMembershipTransactions(transactionsPagination.current + 1)}
                        disabled={transactionsPagination.current === transactionsPagination.pages}
                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          Showing page <span className="font-medium">{transactionsPagination.current}</span> of{' '}
                          <span className="font-medium">{transactionsPagination.pages}</span> ({transactionsPagination.total} total)
                        </p>
                      </div>
                      <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                          {Array.from({ length: transactionsPagination.pages }, (_, i) => i + 1).map((page) => (
                            <button
                              key={page}
                              onClick={() => fetchMembershipTransactions(page)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                page === transactionsPagination.current
                                  ? 'z-10 bg-primary-50 dark:bg-primary-900/20 border-primary-500 text-primary-600 dark:text-primary-400'
                                  : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                              } ${page === 1 ? 'rounded-l-md' : ''} ${page === transactionsPagination.pages ? 'rounded-r-md' : ''}`}
                            >
                              {page}
                            </button>
                          ))}
                        </nav>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
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

      {/* View Transactions Button */}
      <div className="flex justify-center">
        <button
          onClick={handleViewTransactions}
          className="flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 shadow-lg"
        >
          <Eye className="w-5 h-5" />
          <span>View Membership Transactions</span>
        </button>
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
