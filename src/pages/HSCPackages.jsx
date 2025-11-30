import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  AlertCircle, 
  CheckCircle,
  Eye,
  EyeOff,
  DollarSign
} from 'lucide-react';
import { adminAPI } from '../config/api';

const HSCPackages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [hscConfig, setHscConfig] = useState({ hscValue: 100, currency: 'LKR' });

  const [formData, setFormData] = useState({
    name: '',
    hscAmount: '',
    discount: 0,
    bonusHsgAmount: '',
    bonusHsdAmount: '',
    isActive: true,
    description: '',
    features: ['']
  });

  useEffect(() => {
    fetchPackages();
    fetchHSCConfig();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getHSCPackages();
      setPackages(response.data.packages || []);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch packages');
    } finally {
      setLoading(false);
    }
  };

  const fetchHSCConfig = async () => {
    try {
      const response = await adminAPI.getHSCConfig();
      setHscConfig(response.data);
    } catch (error) {
      console.error('Failed to fetch HSC config:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      hscAmount: '',
      discount: 0,
      bonusHsgAmount: '',
      bonusHsdAmount: '',
      isActive: true,
      description: '',
      features: ['']
    });
    setEditingPackage(null);
    setShowForm(false);
  };

  const handleEdit = (pkg) => {
    setFormData({
      name: pkg.name,
      hscAmount: pkg.hscAmount.toString(),
      discount: pkg.discount,
      bonusHsgAmount: pkg.bonusHsgAmount?.toString() || '',
      bonusHsdAmount: pkg.bonusHsdAmount?.toString() || '',
      isActive: pkg.isActive,
      description: pkg.description || '',
      features: pkg.features.length > 0 ? pkg.features : ['']
    });
    setEditingPackage(pkg);
    setShowForm(true);
  };

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const addFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ''] });
  };

  const removeFeature = (index) => {
    if (formData.features.length > 1) {
      const newFeatures = formData.features.filter((_, i) => i !== index);
      setFormData({ ...formData, features: newFeatures });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validate form
    if (!formData.name || !formData.hscAmount) {
      setError('Name and HSC Amount are required');
      return;
    }

    const hscAmount = parseInt(formData.hscAmount);
    if (isNaN(hscAmount) || hscAmount <= 0) {
      setError('HSC Amount must be a positive number');
      return;
    }

    // Parse bonus amounts (optional, default to 0)
    const bonusHsgAmount = formData.bonusHsgAmount ? parseInt(formData.bonusHsgAmount) : 0;
    const bonusHsdAmount = formData.bonusHsdAmount ? parseInt(formData.bonusHsdAmount) : 0;

    // Filter out empty features
    const features = formData.features.filter(feature => feature.trim() !== '');

    const packageData = {
      name: formData.name,
      hscAmount: hscAmount,
      discount: formData.discount,
      bonusHsgAmount: bonusHsgAmount,
      bonusHsdAmount: bonusHsdAmount,
      isActive: formData.isActive,
      description: formData.description,
      features: features
    };

    try {
      if (editingPackage) {
        await adminAPI.updateHSCPackage(editingPackage._id, packageData);
        setSuccess('Package updated successfully');
      } else {
        await adminAPI.createHSCPackage(packageData);
        setSuccess('Package created successfully');
      }

      resetForm();
      fetchPackages();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save package');
    }
  };

  const handleDelete = async (packageId) => {
    if (!window.confirm('Are you sure you want to delete this package?')) {
      return;
    }

    try {
      await adminAPI.deleteHSCPackage(packageId);
      setSuccess('Package deleted successfully');
      fetchPackages();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete package');
    }
  };

  const calculatePrice = (hscAmount, discount = 0) => {
    const basePrice = hscAmount * hscConfig.hscValue;
    const discountAmount = (basePrice * discount) / 100;
    return basePrice - discountAmount;
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            HSC Packages Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage HSC packages for users to purchase
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Package</span>
        </button>
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

      {/* HSC Value Info */}
      <div className="card p-4 bg-blue-50 dark:bg-blue-900/20">
        <div className="flex items-center">
          <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
          <span className="text-sm text-blue-700 dark:text-blue-300">
            Current HSC Value: 1 HSC = {hscConfig.hscValue} {hscConfig.currency}
          </span>
        </div>
      </div>

      {/* Package Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingPackage ? 'Edit Package' : 'Add New Package'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Package Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    placeholder="Enter package name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    HSC Amount *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.hscAmount}
                    onChange={(e) => setFormData({ ...formData, hscAmount: e.target.value })}
                    className="input-field"
                    placeholder="Enter HSC amount"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: parseInt(e.target.value) || 0 })}
                    className="input-field"
                    placeholder="Enter discount percentage"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-6">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded border-gray-300 text-admin-600 focus:ring-admin-500"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Active Package
                  </label>
                </div>
              </div>

              {/* Bonus HSG and HSD Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Bonus HSG Amount (Optional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.bonusHsgAmount}
                    onChange={(e) => setFormData({ ...formData, bonusHsgAmount: e.target.value })}
                    className="input-field"
                    placeholder="Enter bonus HSG amount"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    HSG tokens given as bonus with this package
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Bonus HSD Amount (Optional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.bonusHsdAmount}
                    onChange={(e) => setFormData({ ...formData, bonusHsdAmount: e.target.value })}
                    className="input-field"
                    placeholder="Enter bonus HSD amount"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    HSD tokens given as bonus with this package
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                  rows="3"
                  placeholder="Enter package description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Features
                </label>
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => handleFeatureChange(index, e.target.value)}
                      className="input-field flex-1"
                      placeholder="Enter feature"
                    />
                    {formData.features.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addFeature}
                  className="text-admin-600 hover:text-admin-700 dark:text-admin-400 dark:hover:text-admin-300 text-sm"
                >
                  + Add Feature
                </button>
              </div>

              {/* Price Preview */}
              {formData.hscAmount && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Price Preview</h4>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p>Base Price: {parseInt(formData.hscAmount) * hscConfig.hscValue} {hscConfig.currency}</p>
                    {formData.discount > 0 && (
                      <>
                        <p>Discount ({formData.discount}%): -{((parseInt(formData.hscAmount) * hscConfig.hscValue * formData.discount) / 100).toFixed(2)} {hscConfig.currency}</p>
                        <p className="font-semibold text-green-600 dark:text-green-400">
                          Final Price: {calculatePrice(parseInt(formData.hscAmount), formData.discount).toFixed(2)} {hscConfig.currency}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingPackage ? 'Update' : 'Create'} Package</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <div key={pkg._id} className="card p-6 relative">
            {/* Status Badge */}
            <div className="absolute top-4 right-4">
              {pkg.isActive ? (
                <div className="flex items-center text-green-600 dark:text-green-400">
                  <Eye className="w-4 h-4 mr-1" />
                  <span className="text-xs font-medium">Active</span>
                </div>
              ) : (
                <div className="flex items-center text-gray-500 dark:text-gray-400">
                  <EyeOff className="w-4 h-4 mr-1" />
                  <span className="text-xs font-medium">Inactive</span>
                </div>
              )}
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {pkg.name}
              </h3>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-2xl font-bold text-admin-600 dark:text-admin-400">
                  {pkg.hscAmount} HSC
                </span>
                {pkg.discount > 0 && (
                  <span className="bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-2 py-1 rounded-full text-xs font-medium">
                    {pkg.discount}% OFF
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {pkg.discount > 0 ? (
                  <>
                    <p className="line-through">
                      {(pkg.hscAmount * hscConfig.hscValue).toFixed(2)} {hscConfig.currency}
                    </p>
                    <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                      {calculatePrice(pkg.hscAmount, pkg.discount).toFixed(2)} {hscConfig.currency}
                    </p>
                  </>
                ) : (
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {(pkg.hscAmount * hscConfig.hscValue).toFixed(2)} {hscConfig.currency}
                  </p>
                )}
              </div>
            </div>

            {/* Bonus Tokens Display */}
            {(pkg.bonusHsgAmount > 0 || pkg.bonusHsdAmount > 0) && (
              <div className="mb-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                <h4 className="text-xs font-semibold text-purple-700 dark:text-purple-300 mb-2">🎁 Bonus Tokens:</h4>
                <div className="flex flex-wrap gap-2">
                  {pkg.bonusHsgAmount > 0 && (
                    <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded-full text-xs font-medium">
                      +{pkg.bonusHsgAmount} HSG
                    </span>
                  )}
                  {pkg.bonusHsdAmount > 0 && (
                    <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full text-xs font-medium">
                      +{pkg.bonusHsdAmount} HSD
                    </span>
                  )}
                </div>
              </div>
            )}

            {pkg.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {pkg.description}
              </p>
            )}

            {pkg.features && pkg.features.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Features:</h4>
                <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-500 mr-1">•</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Created: {new Date(pkg.createdAt).toLocaleDateString()}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(pkg)}
                  className="p-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  title="Edit package"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(pkg._id)}
                  className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Delete package"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {packages.length === 0 && !loading && (
        <div className="card p-8 text-center">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No packages found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Get started by creating your first HSC package.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary"
          >
            Create Package
          </button>
        </div>
      )}
    </div>
  );
};

export default HSCPackages;
