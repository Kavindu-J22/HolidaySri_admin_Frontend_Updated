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
  Briefcase,
  Star,
  Settings,
  Eye,
  ArrowLeft
} from 'lucide-react';
import { adminAPI } from '../config/api';

const CommercialPartnerSettings = () => {
  const [config, setConfig] = useState({
    monthlyCharge: 5000,
    yearlyCharge: 50000,
    features: []
  });
  const [stats, setStats] = useState({
    totalPartners: 0,
    activePartners: 0,
    expiredPartners: 0,
    monthlyPartners: 0,
    yearlyPartners: 0,
    revenue: {
      monthly: { count: 0, totalRevenue: 0 },
      yearly: { count: 0, totalRevenue: 0 }
    },
    totalRevenue: 0
  });
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('settings');
  const [partnersLoading, setPartnersLoading] = useState(false);
  const [partnersPagination, setPartnersPagination] = useState({
    current: 1,
    pages: 1,
    total: 0
  });

  useEffect(() => {
    fetchPartnerData();
  }, []);

  const fetchPartnerData = async () => {
    try {
      setLoading(true);

      console.log('Fetching commercial partner data...');
      const [configResponse, statsResponse] = await Promise.all([
        adminAPI.getCommercialPartnerConfig(),
        adminAPI.getCommercialPartnerStats()
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
      console.error('Error fetching commercial partner data:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch commercial partner data';
      setMessage({ type: 'error', text: `Failed to fetch commercial partner data: ${errorMessage}` });
    } finally {
      setLoading(false);
    }
  };

  const fetchPartners = async (page = 1) => {
    try {
      setPartnersLoading(true);
      const response = await adminAPI.getCommercialPartners({ page, limit: 10 });
      
      if (response.data.success) {
        setPartners(response.data.partners);
        setPartnersPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching partners:', error);
      setMessage({ type: 'error', text: 'Failed to fetch partners list' });
    } finally {
      setPartnersLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    try {
      setSaving(true);
      setMessage({ type: '', text: '' });

      const response = await adminAPI.updateCommercialPartnerConfig({
        monthlyCharge: parseFloat(config.monthlyCharge),
        yearlyCharge: parseFloat(config.yearlyCharge),
        features: config.features
      });

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Commercial partner configuration updated successfully!' });
        setConfig(response.data.config);
      }
    } catch (error) {
      console.error('Error updating commercial partner config:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update commercial partner configuration';
      setMessage({ type: 'error', text: `Failed to update commercial partner configuration: ${errorMessage}` });
    } finally {
      setSaving(false);
    }
  };

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...config.features];
    newFeatures[index] = value;
    setConfig({ ...config, features: newFeatures });
  };

  const addFeature = () => {
    setConfig({ ...config, features: [...config.features, ''] });
  };

  const removeFeature = (index) => {
    const newFeatures = config.features.filter((_, i) => i !== index);
    setConfig({ ...config, features: newFeatures });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  // Tab content for partners list
  if (activeTab === 'partners') {
    if (!partners.length && !partnersLoading) {
      fetchPartners();
    }

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setActiveTab('settings')}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Settings</span>
            </button>
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Commercial Partners List
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View and manage all commercial partners
          </p>
        </div>

        {/* Partners Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            {partnersLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader className="w-6 h-6 animate-spin text-primary-600" />
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Expiration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {partners.map((partner) => (
                    <tr key={partner._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={partner.businessLogo}
                              alt={partner.companyName}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {partner.companyName}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {partner.businessType}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {partner.userId?.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {partner.userId?.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          partner.partnershipType === 'yearly'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                        }`}>
                          {partner.partnershipType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          partner.status === 'active'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : partner.status === 'expired'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                        }`}>
                          {partner.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {new Date(partner.expirationDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {partner.amount.toLocaleString()} LKR
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {partnersPagination.pages > 1 && (
            <div className="bg-white dark:bg-gray-900 px-4 py-3 border-t border-gray-200 dark:border-gray-700 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => fetchPartners(partnersPagination.current - 1)}
                    disabled={partnersPagination.current === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => fetchPartners(partnersPagination.current + 1)}
                    disabled={partnersPagination.current === partnersPagination.pages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Showing <span className="font-medium">{((partnersPagination.current - 1) * 10) + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(partnersPagination.current * 10, partnersPagination.total)}
                      </span>{' '}
                      of <span className="font-medium">{partnersPagination.total}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      {Array.from({ length: partnersPagination.pages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => fetchPartners(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === partnersPagination.current
                              ? 'z-10 bg-primary-50 dark:bg-primary-900/20 border-primary-500 text-primary-600 dark:text-primary-400'
                              : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                          } ${page === 1 ? 'rounded-l-md' : ''} ${page === partnersPagination.pages ? 'rounded-r-md' : ''}`}
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
            Commercial Partner Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage Holidaysri commercial partner pricing and features
          </p>
        </div>
        <Briefcase className="w-8 h-8 text-blue-500" />
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'settings'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <Settings className="w-4 h-4 inline mr-2" />
            Settings
          </button>
          <button
            onClick={() => setActiveTab('partners')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'partners'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <Eye className="w-4 h-4 inline mr-2" />
            View Partners ({stats.totalPartners})
          </button>
        </nav>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
        }`}>
          <div className="flex items-center space-x-2">
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            )}
            <p className={message.type === 'success' 
              ? 'text-green-700 dark:text-green-400' 
              : 'text-red-700 dark:text-red-400'
            }>
              {message.text}
            </p>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Partners</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalPartners}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Partners</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activePartners}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Partners</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.monthlyPartners}</p>
            </div>
            <Calendar className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
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
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Pricing Configuration
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Monthly Charge (LKR)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                value={config.monthlyCharge}
                onChange={(e) => setConfig({ ...config, monthlyCharge: e.target.value })}
                className="input pl-10"
                placeholder="5000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Yearly Charge (LKR)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                value={config.yearlyCharge}
                onChange={(e) => setConfig({ ...config, yearlyCharge: e.target.value })}
                className="input pl-10"
                placeholder="50000"
              />
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Partner Features
            </label>
            <button
              onClick={addFeature}
              className="btn-secondary text-sm"
            >
              Add Feature
            </button>
          </div>

          <div className="space-y-3">
            {config.features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <Star className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                <input
                  type="text"
                  value={feature}
                  onChange={(e) => handleFeatureChange(index, e.target.value)}
                  className="input flex-1"
                  placeholder="Enter feature description"
                />
                <button
                  onClick={() => removeFeature(index)}
                  className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSaveConfig}
            disabled={saving}
            className="btn-primary flex items-center space-x-2"
          >
            {saving ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Configuration</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommercialPartnerSettings;
