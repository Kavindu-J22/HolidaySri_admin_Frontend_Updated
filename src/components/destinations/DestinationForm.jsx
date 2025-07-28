import React, { useState, useEffect } from 'react';
import { ArrowLeft, Upload, X, MapPin, Star, Image as ImageIcon } from 'lucide-react';
import ImageUpload from '../common/ImageUpload';

const DestinationForm = ({ destination, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    description: '',
    images: [],
    mapUrl: '',
    distanceFromColombo: '',
    province: '',
    district: '',
    climate: '',
    recommendedToVisit: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const destinationTypes = ['Famous', 'Popular', 'Hidden', 'Adventure', 'Cultural', 'Beach', 'Mountain', 'Historical', 'Wildlife', 'Religious'];
  const climateOptions = [
    'Dry zone',
    'Intermediate zone',
    'Montane zone',
    'Semi-Arid zone',
    'Oceanic zone',
    'Tropical Wet zone',
    'Tropical Submontane',
    'Tropical Dry Zone',
    'Tropical Monsoon Climate',
    'Tropical Savanna Climate'
  ];

  const provincesAndDistricts = {
    "Western Province": ["Colombo", "Gampaha", "Kalutara"],
    "Central Province": ["Kandy", "Matale", "Nuwara Eliya"],
    "Southern Province": ["Galle", "Matara", "Hambantota"],
    "Northern Province": ["Jaffna", "Mannar", "Vavuniya", "Kilinochchi", "Mullaitivu"],
    "Eastern Province": ["Batticaloa", "Ampara", "Trincomalee"],
    "North Western Province": ["Kurunegala", "Puttalam"],
    "North Central Province": ["Anuradhapura", "Polonnaruwa"],
    "Uva Province": ["Badulla", "Monaragala"],
    "Sabaragamuwa Province": ["Kegalle", "Ratnapura"]
  };

  useEffect(() => {
    if (destination) {
      setFormData({
        name: destination.name || '',
        type: destination.type || '',
        description: destination.description || '',
        images: destination.images || [],
        mapUrl: destination.mapUrl || '',
        distanceFromColombo: destination.distanceFromColombo?.toString() || '',
        province: destination.province || '',
        district: destination.district || '',
        climate: destination.climate || '',
        recommendedToVisit: destination.recommendedToVisit || ''
      });
    }
  }, [destination]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Reset district when province changes
    if (name === 'province') {
      setFormData(prev => ({
        ...prev,
        district: ''
      }));
    }
  };

  const handleImagesChange = (images) => {
    setFormData(prev => ({
      ...prev,
      images
    }));
    
    if (errors.images) {
      setErrors(prev => ({
        ...prev,
        images: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Destination name is required';
    }

    if (!formData.type) {
      newErrors.type = 'Destination type is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length > 2000) {
      newErrors.description = 'Description must be less than 2000 characters';
    }

    if (!formData.images || formData.images.length === 0) {
      newErrors.images = 'At least one image is required';
    } else if (formData.images.length > 5) {
      newErrors.images = 'Maximum 5 images allowed';
    }

    if (!formData.mapUrl.trim()) {
      newErrors.mapUrl = 'Google Maps URL is required';
    }

    if (!formData.distanceFromColombo) {
      newErrors.distanceFromColombo = 'Distance from Colombo is required';
    } else if (isNaN(formData.distanceFromColombo) || parseFloat(formData.distanceFromColombo) < 0) {
      newErrors.distanceFromColombo = 'Distance must be a valid positive number';
    }

    if (!formData.province) {
      newErrors.province = 'Province is required';
    }

    if (!formData.district) {
      newErrors.district = 'District is required';
    } else if (formData.province && !provincesAndDistricts[formData.province]?.includes(formData.district)) {
      newErrors.district = 'District must be valid for the selected province';
    }

    if (!formData.climate) {
      newErrors.climate = 'Climate is required';
    }

    if (!formData.recommendedToVisit.trim()) {
      newErrors.recommendedToVisit = 'Recommended visit time is required';
    } else if (formData.recommendedToVisit.length > 100) {
      newErrors.recommendedToVisit = 'Recommended visit time must be less than 100 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        ...formData,
        distanceFromColombo: parseFloat(formData.distanceFromColombo)
      });
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onCancel}
          className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {destination ? 'Edit Destination' : 'Add New Destination'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {destination ? 'Update destination information' : 'Create a new tourist destination'}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Left Column */}
          <div className="space-y-4 lg:space-y-6">
            {/* Basic Information */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Basic Information
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Destination Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`input w-full ${errors.name ? 'border-red-500' : ''}`}
                    placeholder="Enter destination name"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Destination Type *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className={`input w-full ${errors.type ? 'border-red-500' : ''}`}
                  >
                    <option value="">Select destination type</option>
                    {destinationTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {errors.type && (
                    <p className="text-red-500 text-sm mt-1">{errors.type}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={6}
                    className={`input w-full resize-none ${errors.description ? 'border-red-500' : ''}`}
                    placeholder="Describe the destination, its attractions, and what makes it special..."
                  />
                  <div className="flex justify-between items-center mt-1">
                    {errors.description ? (
                      <p className="text-red-500 text-sm">{errors.description}</p>
                    ) : (
                      <p className="text-gray-500 text-sm">
                        {formData.description.length}/2000 characters
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Location Information
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Google Maps URL *
                  </label>
                  <input
                    type="url"
                    name="mapUrl"
                    value={formData.mapUrl}
                    onChange={handleInputChange}
                    className={`input w-full ${errors.mapUrl ? 'border-red-500' : ''}`}
                    placeholder="https://maps.google.com/..."
                  />
                  {errors.mapUrl && (
                    <p className="text-red-500 text-sm mt-1">{errors.mapUrl}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Distance from Colombo (km) *
                  </label>
                  <input
                    type="number"
                    name="distanceFromColombo"
                    value={formData.distanceFromColombo}
                    onChange={handleInputChange}
                    min="0"
                    step="0.1"
                    className={`input w-full ${errors.distanceFromColombo ? 'border-red-500' : ''}`}
                    placeholder="Enter distance in kilometers"
                  />
                  {errors.distanceFromColombo && (
                    <p className="text-red-500 text-sm mt-1">{errors.distanceFromColombo}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Province *
                    </label>
                    <select
                      name="province"
                      value={formData.province}
                      onChange={handleInputChange}
                      className={`input w-full ${errors.province ? 'border-red-500' : ''}`}
                    >
                      <option value="">Select province</option>
                      {Object.keys(provincesAndDistricts).map(province => (
                        <option key={province} value={province}>{province}</option>
                      ))}
                    </select>
                    {errors.province && (
                      <p className="text-red-500 text-sm mt-1">{errors.province}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      District *
                    </label>
                    <select
                      name="district"
                      value={formData.district}
                      onChange={handleInputChange}
                      className={`input w-full ${errors.district ? 'border-red-500' : ''}`}
                      disabled={!formData.province}
                    >
                      <option value="">Select district</option>
                      {formData.province && provincesAndDistricts[formData.province]?.map(district => (
                        <option key={district} value={district}>{district}</option>
                      ))}
                    </select>
                    {errors.district && (
                      <p className="text-red-500 text-sm mt-1">{errors.district}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Climate *
                  </label>
                  <select
                    name="climate"
                    value={formData.climate}
                    onChange={handleInputChange}
                    className={`input w-full ${errors.climate ? 'border-red-500' : ''}`}
                  >
                    <option value="">Select climate</option>
                    {climateOptions.map(climate => (
                      <option key={climate} value={climate}>{climate}</option>
                    ))}
                  </select>
                  {errors.climate && (
                    <p className="text-red-500 text-sm mt-1">{errors.climate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Recommended to Visit *
                  </label>
                  <input
                    type="text"
                    name="recommendedToVisit"
                    value={formData.recommendedToVisit}
                    onChange={handleInputChange}
                    className={`input w-full ${errors.recommendedToVisit ? 'border-red-500' : ''}`}
                    placeholder="e.g., January to March, Year-round, December to April"
                  />
                  {errors.recommendedToVisit && (
                    <p className="text-red-500 text-sm mt-1">{errors.recommendedToVisit}</p>
                  )}
                  <p className="text-gray-500 text-sm mt-1">
                    Best time to visit this destination (e.g., seasonal recommendations)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4 lg:space-y-6">
            {/* Images */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Images (1-5 required) *
              </h3>
              
              <ImageUpload
                images={formData.images}
                onChange={handleImagesChange}
                maxImages={5}
                cloudName="daa9e83as"
                uploadPreset="ml_default"
              />
              
              {errors.images && (
                <p className="text-red-500 text-sm mt-2">{errors.images}</p>
              )}
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary w-full sm:w-auto order-2 sm:order-1"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary w-full sm:w-auto order-1 sm:order-2"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>{destination ? 'Updating...' : 'Creating...'}</span>
              </div>
            ) : (
              destination ? 'Update Destination' : 'Create Destination'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DestinationForm;
