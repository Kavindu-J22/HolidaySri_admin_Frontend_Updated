import React, { useState, useEffect } from 'react';
import { DollarSign, Save, AlertCircle, CheckCircle, History, Gift, Coins } from 'lucide-react';
import { adminAPI } from '../config/api';

const HSCManagement = () => {
  const [tokenConfig, setTokenConfig] = useState({
    hscValue: 100,
    hsgValue: 1,
    hsdValue: 1,
    currency: 'LKR',
    lastUpdated: null,
    updatedBy: null
  });
  const [newValues, setNewValues] = useState({
    hsc: '',
    hsg: '',
    hsd: ''
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchTokenConfig();
  }, []);

  const fetchTokenConfig = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getHSCConfig();
      setTokenConfig(response.data);
      setNewValues({
        hsc: response.data.hscValue.toString(),
        hsg: response.data.hsgValue?.toString() || '1',
        hsd: response.data.hsdValue?.toString() || '1'
      });
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch token configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateToken = async (tokenType) => {
    const value = parseFloat(newValues[tokenType]);
    if (!value || value <= 0) {
      setError(`Please enter a valid ${tokenType.toUpperCase()} value`);
      return;
    }

    try {
      setUpdating(true);
      setError(null);
      setSuccess(null);

      const updateData = {
        currency: tokenConfig.currency
      };

      if (tokenType === 'hsc') updateData.hscValue = value;
      if (tokenType === 'hsg') updateData.hsgValue = value;
      if (tokenType === 'hsd') updateData.hsdValue = value;

      const response = await adminAPI.updateHSCConfig(updateData);

      setTokenConfig(response.data.config);
      setSuccess(`${tokenType.toUpperCase()} value updated successfully`);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError(error.response?.data?.message || `Failed to update ${tokenType.toUpperCase()} value`);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Token Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage HSC, HSG, and HSD token values and configuration
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
            <span className="text-sm text-red-600 dark:text-red-400">{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
            <span className="text-sm text-green-600 dark:text-green-400">{success}</span>
          </div>
        </div>
      )}

      {/* Current Token Values Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* HSC Configuration */}
        <div className="card p-6">
          <div className="flex items-center mb-4">
            <Coins className="w-6 h-6 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              HSC Tokens
            </h3>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Current Value
            </p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              1 HSC = {tokenConfig.hscValue} {tokenConfig.currency}
            </p>
          </div>
        </div>

        {/* HSG Configuration */}
        <div className="card p-6">
          <div className="flex items-center mb-4">
            <Gift className="w-6 h-6 text-green-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              HSG Gems
            </h3>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Current Value
            </p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              1 HSG = {tokenConfig.hsgValue} {tokenConfig.currency}
            </p>
          </div>
        </div>

        {/* HSD Configuration */}
        <div className="card p-6">
          <div className="flex items-center mb-4">
            <DollarSign className="w-6 h-6 text-purple-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              HSD Diamond
            </h3>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Current Value
            </p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              1 HSD = {tokenConfig.hsdValue} {tokenConfig.currency}
            </p>
          </div>
        </div>
      </div>

      {/* Token Update Forms */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Update HSC Value */}
        <div className="card p-6">
          <div className="flex items-center mb-4">
            <Coins className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Update HSC
            </h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                HSC Value ({tokenConfig.currency})
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={newValues.hsc}
                onChange={(e) => setNewValues({...newValues, hsc: e.target.value})}
                className="input-field"
                placeholder="Enter HSC value"
              />
            </div>
            <button
              onClick={() => handleUpdateToken('hsc')}
              disabled={updating || newValues.hsc === tokenConfig.hscValue.toString()}
              className="btn-primary w-full"
            >
              Update HSC
            </button>
          </div>
        </div>

        {/* Update HSG Value */}
        <div className="card p-6">
          <div className="flex items-center mb-4">
            <Gift className="w-5 h-5 text-green-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Update HSG
            </h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                HSG Value ({tokenConfig.currency})
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={newValues.hsg}
                onChange={(e) => setNewValues({...newValues, hsg: e.target.value})}
                className="input-field"
                placeholder="Enter HSG value"
              />
            </div>
            <button
              onClick={() => handleUpdateToken('hsg')}
              disabled={updating || newValues.hsg === tokenConfig.hsgValue?.toString()}
              className="btn-primary w-full"
            >
              Update HSG
            </button>
          </div>
        </div>

        {/* Update HSD Value */}
        <div className="card p-6">
          <div className="flex items-center mb-4">
            <DollarSign className="w-5 h-5 text-purple-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Update HSD
            </h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                HSD Value ({tokenConfig.currency})
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={newValues.hsd}
                onChange={(e) => setNewValues({...newValues, hsd: e.target.value})}
                className="input-field"
                placeholder="Enter HSD value"
              />
            </div>
            <button
              onClick={() => handleUpdateToken('hsd')}
              disabled={updating || newValues.hsd === tokenConfig.hsdValue?.toString()}
              className="btn-primary w-full"
            >
              Update HSD
            </button>
          </div>
        </div>
      </div>

      {/* Token Information */}
      <div className="card p-6">
        <div className="flex items-center mb-6">
          <History className="w-6 h-6 text-indigo-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Token Information
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">HSC (Holidaysri Coins)</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Used for publishing advertisements and promoting tourism services. Users purchase HSC tokens to advertise their services.
            </p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">HSG (Holidaysri Gems)</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Welcome gift tokens given to new users (100 HSG). Can be used for publishing first advertisements. Convertible to LKR value.
            </p>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
            <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-2">HSD (Holidaysri Diamond)</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Earnings from platform activities. Users start with 0 HSD and earn through various platform interactions. Convertible to LKR value.
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Currency</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {tokenConfig.currency}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Last Updated</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {tokenConfig.lastUpdated
                ? new Date(tokenConfig.lastUpdated).toLocaleDateString()
                : 'Never'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HSCManagement;
