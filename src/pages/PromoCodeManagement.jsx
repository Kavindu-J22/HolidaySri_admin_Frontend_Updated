import React, { useState, useEffect } from 'react';
import { adminAPI } from '../config/api';
import { 
  Gift, 
  Save, 
  RefreshCw, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Clock,
  ShoppingCart,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const PromoCodeManagement = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    silver: {
      price: 8000,
      discountRate: 0,
      earningForPurchase: 500,
      earningForMonthlyAd: 1000,
      earningForDailyAd: 100
    },
    gold: {
      price: 15000,
      discountRate: 0,
      earningForPurchase: 1000,
      earningForMonthlyAd: 2000,
      earningForDailyAd: 200
    },
    diamond: {
      price: 25000,
      discountRate: 0,
      earningForPurchase: 2000,
      earningForMonthlyAd: 3000,
      earningForDailyAd: 300
    },
    free: {
      price: 0,
      discountRate: 0,
      earningForPurchase: 0,
      earningForMonthlyAd: 50,
      earningForDailyAd: 10
    },
    discounts: {
      monthlyAdDiscount: 500,
      dailyAdDiscount: 50,
      purchaseDiscount: 200
    }
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getPromoCodeConfig();
      setConfig(response.data);
      setFormData(response.data);
    } catch (error) {
      console.error('Error fetching promo code config:', error);
      setMessage({ type: 'error', text: 'Failed to load promo code configuration' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (type, field, value) => {
    if (type === 'discounts') {
      setFormData(prev => ({
        ...prev,
        discounts: {
          ...prev.discounts,
          [field]: parseFloat(value) || 0
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [type]: {
          ...prev[type],
          [field]: parseFloat(value) || 0
        }
      }));
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage({ type: '', text: '' });

      await adminAPI.updatePromoCodeConfig(formData);
      setMessage({ type: 'success', text: 'Promo code configuration updated successfully!' });
      await fetchConfig();
    } catch (error) {
      console.error('Error updating promo code config:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update promo code configuration' 
      });
    } finally {
      setSaving(false);
    }
  };

  const promoTypes = [
    {
      key: 'silver',
      name: 'Silver Promo Code',
      color: 'bg-gray-100 border-gray-300',
      icon: '🥈'
    },
    {
      key: 'gold',
      name: 'Gold Promo Code',
      color: 'bg-yellow-100 border-yellow-300',
      icon: '🥇'
    },
    {
      key: 'diamond',
      name: 'Diamond Promo Code',
      color: 'bg-blue-100 border-blue-300',
      icon: '💎'
    },
    {
      key: 'free',
      name: 'Free Promo Code',
      color: 'bg-green-100 border-green-300',
      icon: '🆓'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Promo Code Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Configure promo code types, prices, and earning amounts
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={fetchConfig}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            <Save className={`w-4 h-4 ${saving ? 'animate-spin' : ''}`} />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`flex items-center space-x-2 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Promo Code Types Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {promoTypes.map((promoType) => (
          <div key={promoType.key} className={`p-6 rounded-lg border-2 ${promoType.color} dark:bg-gray-800 dark:border-gray-600`}>
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-2xl">{promoType.icon}</span>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{promoType.name}</h3>
            </div>

            <div className="space-y-4">
              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Price (LKR)
                </label>
                <input
                  type="number"
                  value={formData[promoType.key]?.price || 0}
                  onChange={(e) => handleInputChange(promoType.key, 'price', e.target.value)}
                  disabled={promoType.key === 'free'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-white"
                  min="0"
                />
                {promoType.key === 'free' && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Free promo code price is always 0 LKR</p>
                )}
              </div>

              {/* Discount Rate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <TrendingUp className="w-4 h-4 inline mr-1" />
                  Discount Rate (%)
                </label>
                <input
                  type="number"
                  value={formData[promoType.key]?.discountRate || 0}
                  onChange={(e) => handleInputChange(promoType.key, 'discountRate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  min="0"
                  max="100"
                />
              </div>

              {/* Earning for Purchase */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <ShoppingCart className="w-4 h-4 inline mr-1" />
                  Earning for Purchase PromoCode (LKR)
                </label>
                <input
                  type="number"
                  value={formData[promoType.key]?.earningForPurchase || 0}
                  onChange={(e) => handleInputChange(promoType.key, 'earningForPurchase', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  min="0"
                />
              </div>

              {/* Earning for Monthly Ad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Earning for Monthly Ad (LKR)
                </label>
                <input
                  type="number"
                  value={formData[promoType.key]?.earningForMonthlyAd || 0}
                  onChange={(e) => handleInputChange(promoType.key, 'earningForMonthlyAd', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  min="0"
                />
              </div>

              {/* Earning for Daily Ad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Earning for Daily Ad (LKR)
                </label>
                <input
                  type="number"
                  value={formData[promoType.key]?.earningForDailyAd || 0}
                  onChange={(e) => handleInputChange(promoType.key, 'earningForDailyAd', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  min="0"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Global Discount Settings */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3 mb-6">
          <Gift className="w-6 h-6 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Global Discount Settings
          </h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          These discount amounts apply to all promo code types when used for specific purposes.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Monthly Ad Discount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Monthly Advertisement Discount (LKR)
            </label>
            <input
              type="number"
              value={formData.discounts?.monthlyAdDiscount || 0}
              onChange={(e) => handleInputChange('discounts', 'monthlyAdDiscount', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              min="0"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Discount when applying promo codes to monthly ads
            </p>
          </div>

          {/* Daily Ad Discount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              Daily Advertisement Discount (LKR)
            </label>
            <input
              type="number"
              value={formData.discounts?.dailyAdDiscount || 0}
              onChange={(e) => handleInputChange('discounts', 'dailyAdDiscount', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              min="0"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Discount when applying promo codes to daily ads
            </p>
          </div>

          {/* Purchase Discount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <ShoppingCart className="w-4 h-4 inline mr-1" />
              Purchase-Promo Discount (LKR)
            </label>
            <input
              type="number"
              value={formData.discounts?.purchaseDiscount || 0}
              onChange={(e) => handleInputChange('discounts', 'purchaseDiscount', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              min="0"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Discount when applying promo codes to purchases
            </p>
          </div>
        </div>
      </div>

      {/* Configuration Info */}
      {config && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center space-x-2 text-blue-800 dark:text-blue-300">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Configuration Info</span>
          </div>
          <div className="mt-2 text-sm text-blue-700 dark:text-blue-400">
            <p>Last updated: {new Date(config.lastUpdated).toLocaleString()}</p>
            <p>Updated by: {config.updatedBy}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromoCodeManagement;
