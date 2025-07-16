import React, { useState, useEffect } from 'react';
import { DollarSign, Save, AlertCircle, CheckCircle, History } from 'lucide-react';
import { adminAPI } from '../config/api';

const HSCManagement = () => {
  const [hscConfig, setHscConfig] = useState({
    hscValue: 100,
    currency: 'LKR',
    lastUpdated: null,
    updatedBy: null
  });
  const [newValue, setNewValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchHSCConfig();
  }, []);

  const fetchHSCConfig = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getHSCConfig();
      setHscConfig(response.data);
      setNewValue(response.data.hscValue.toString());
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch HSC configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateHSC = async (e) => {
    e.preventDefault();
    
    const value = parseFloat(newValue);
    if (!value || value <= 0) {
      setError('Please enter a valid HSC value');
      return;
    }

    try {
      setUpdating(true);
      setError(null);
      setSuccess(null);

      const response = await adminAPI.updateHSCConfig({
        hscValue: value,
        currency: hscConfig.currency
      });

      setHscConfig(response.data.config);
      setSuccess('HSC value updated successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update HSC value');
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
          HSC Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage HSC token value and configuration
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Current Configuration */}
        <div className="card p-6">
          <div className="flex items-center mb-6">
            <DollarSign className="w-6 h-6 text-admin-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Current HSC Configuration
            </h2>
          </div>

          <div className="space-y-4">
            <div className="bg-admin-50 dark:bg-admin-900/20 rounded-lg p-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Current HSC Value
                </p>
                <p className="text-3xl font-bold text-admin-600 dark:text-admin-400">
                  1 HSC = {hscConfig.hscValue} {hscConfig.currency}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Currency</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {hscConfig.currency}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Last Updated</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {hscConfig.lastUpdated 
                    ? new Date(hscConfig.lastUpdated).toLocaleDateString()
                    : 'Never'
                  }
                </p>
              </div>
            </div>

            {hscConfig.updatedBy && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Updated By</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {hscConfig.updatedBy}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Update HSC Value */}
        <div className="card p-6">
          <div className="flex items-center mb-6">
            <Save className="w-6 h-6 text-green-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Update HSC Value
            </h2>
          </div>

          <form onSubmit={handleUpdateHSC} className="space-y-4">
            <div>
              <label htmlFor="hscValue" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                New HSC Value ({hscConfig.currency})
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="hscValue"
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  className="input-field pl-10"
                  placeholder="Enter new HSC value"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                This will be the new value for 1 HSC token
              </p>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2 mt-0.5" />
                <div className="text-sm text-yellow-700 dark:text-yellow-300">
                  <p className="font-medium mb-1">Important:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>This change will affect all future HSC calculations</li>
                    <li>Existing user balances will remain unchanged</li>
                    <li>New purchases will use the updated value</li>
                  </ul>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={updating || newValue === hscConfig.hscValue.toString()}
              className="btn-primary w-full flex items-center justify-center space-x-2"
            >
              {updating ? (
                <div className="loading-spinner"></div>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Update HSC Value</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* HSC Impact Calculator */}
      <div className="card p-6">
        <div className="flex items-center mb-6">
          <History className="w-6 h-6 text-purple-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            HSC Value Impact Calculator
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Current Value
            </p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {hscConfig.hscValue} {hscConfig.currency}
            </p>
          </div>

          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              New Value
            </p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {newValue || '0'} {hscConfig.currency}
            </p>
          </div>

          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Change
            </p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {newValue ? 
                `${((parseFloat(newValue) - hscConfig.hscValue) / hscConfig.hscValue * 100).toFixed(1)}%` 
                : '0%'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HSCManagement;
