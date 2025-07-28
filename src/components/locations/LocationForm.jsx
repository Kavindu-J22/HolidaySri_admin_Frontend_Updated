import React, { useState, useEffect } from 'react';
import { ArrowLeft, Upload, X, Plus, Trash2 } from 'lucide-react';

const LocationForm = ({ location, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    locationType: '',
    description: '',
    images: [],
    mapUrl: '',
    distanceFromColombo: '',
    province: '',
    district: '',
    climate: '',
    recommendedToVisit: '',
    enteringFee: {
      isFree: true,
      amount: 0,
      currency: 'LKR'
    },
    facilities: [],
    nearbyActivities: [],
    mainDestination: ''
  });

  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [newFacility, setNewFacility] = useState('');
  const [newActivity, setNewActivity] = useState('');

  // Constants
  const [locationTypes, setLocationTypes] = useState([]);
  const [climateOptions, setClimateOptions] = useState([]);
  const [provincesAndDistricts, setProvincesAndDistricts] = useState({});
  const [destinations, setDestinations] = useState([]);

  useEffect(() => {
    fetchConstants();
    fetchDestinations();
    
    if (location) {
      setFormData({
        name: location.name || '',
        locationType: location.locationType || '',
        description: location.description || '',
        images: location.images || [],
        mapUrl: location.mapUrl || '',
        distanceFromColombo: location.distanceFromColombo || '',
        province: location.province || '',
        district: location.district || '',
        climate: location.climate || '',
        recommendedToVisit: location.recommendedToVisit || '',
        enteringFee: location.enteringFee || { isFree: true, amount: 0, currency: 'LKR' },
        facilities: location.facilities || [],
        nearbyActivities: location.nearbyActivities || [],
        mainDestination: location.mainDestination?._id || location.mainDestination || ''
      });
    }
  }, [location]);

  const fetchConstants = async () => {
    try {
      const response = await fetch('/api/locations/constants');
      if (response.ok) {
        const data = await response.json();
        setLocationTypes(data.locationTypes);
        setClimateOptions(data.climateOptions);
        setProvincesAndDistricts(data.provincesAndDistricts);
      }
    } catch (error) {
      console.error('Error fetching constants:', error);
    }
  };

  const fetchDestinations = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/destinations?limit=100', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setDestinations(data.destinations);
      }
    } catch (error) {
      console.error('Error fetching destinations:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('enteringFee.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        enteringFee: {
          ...prev.enteringFee,
          [field]: type === 'checkbox' ? checked : (field === 'amount' ? parseFloat(value) || 0 : value)
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleProvinceChange = (e) => {
    const province = e.target.value;
    setFormData(prev => ({
      ...prev,
      province,
      district: '' // Reset district when province changes
    }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Check if adding these files would exceed the limit
    if (formData.images.length + files.length > 6) {
      alert('You can upload a maximum of 6 images');
      return;
    }

    setImageUploading(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);
        formDataUpload.append('upload_preset', 'ml_default');

        const response = await fetch(
          'https://api.cloudinary.com/v1_1/daa9e83as/image/upload',
          {
            method: 'POST',
            body: formDataUpload
          }
        );

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const data = await response.json();
        return {
          url: data.secure_url,
          publicId: data.public_id,
          alt: ''
        };
      });

      const uploadedImages = await Promise.all(uploadPromises);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedImages]
      }));
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Failed to upload images. Please try again.');
    } finally {
      setImageUploading(false);
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const addFacility = () => {
    if (newFacility.trim()) {
      setFormData(prev => ({
        ...prev,
        facilities: [...prev.facilities, newFacility.trim()]
      }));
      setNewFacility('');
    }
  };

  const removeFacility = (index) => {
    setFormData(prev => ({
      ...prev,
      facilities: prev.facilities.filter((_, i) => i !== index)
    }));
  };

  const addActivity = () => {
    if (newActivity.trim()) {
      setFormData(prev => ({
        ...prev,
        nearbyActivities: [...prev.nearbyActivities, newActivity.trim()]
      }));
      setNewActivity('');
    }
  };

  const removeActivity = (index) => {
    setFormData(prev => ({
      ...prev,
      nearbyActivities: prev.nearbyActivities.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      alert('Please enter a location name');
      return;
    }
    
    if (!formData.locationType) {
      alert('Please select a location type');
      return;
    }
    
    if (!formData.description.trim()) {
      alert('Please enter a description');
      return;
    }
    
    if (formData.images.length === 0) {
      alert('Please upload at least one image');
      return;
    }
    
    if (!formData.mapUrl.trim()) {
      alert('Please enter a Google Maps URL');
      return;
    }
    
    if (!formData.distanceFromColombo || formData.distanceFromColombo < 0) {
      alert('Please enter a valid distance from Colombo');
      return;
    }
    
    if (!formData.province) {
      alert('Please select a province');
      return;
    }
    
    if (!formData.district) {
      alert('Please select a district');
      return;
    }
    
    if (!formData.climate) {
      alert('Please select a climate');
      return;
    }
    
    if (!formData.recommendedToVisit.trim()) {
      alert('Please enter the recommended time to visit');
      return;
    }
    
    if (!formData.mainDestination) {
      alert('Please select a main destination');
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
      alert('Failed to save location. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const availableDistricts = formData.province ? provincesAndDistricts[formData.province] || [] : [];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {location ? 'Edit Location' : 'Add New Location'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {location ? 'Update location information' : 'Create a new tourist location'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Basic Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="input"
                placeholder="Enter location name"
                required
              />
            </div>

            {/* Location Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location Type *
              </label>
              <select
                name="locationType"
                value={formData.locationType}
                onChange={handleInputChange}
                className="input"
                required
              >
                <option value="">Select location type</option>
                {locationTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Main Destination */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Main Destination *
              </label>
              <select
                name="mainDestination"
                value={formData.mainDestination}
                onChange={handleInputChange}
                className="input"
                required
              >
                <option value="">Select main destination</option>
                {destinations.map(dest => (
                  <option key={dest._id} value={dest._id}>{dest.name}</option>
                ))}
              </select>
            </div>

            {/* Distance from Colombo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Distance from Colombo (km) *
              </label>
              <input
                type="number"
                name="distanceFromColombo"
                value={formData.distanceFromColombo}
                onChange={handleInputChange}
                className="input"
                placeholder="Enter distance in kilometers (e.g., 2.5)"
                min="0"
                max="500"
                step="0.1"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="input"
              placeholder="Enter detailed description of the location"
              required
            />
          </div>

          {/* Map URL */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Google Maps URL *
            </label>
            <input
              type="url"
              name="mapUrl"
              value={formData.mapUrl}
              onChange={handleInputChange}
              className="input"
              placeholder="https://maps.google.com/..."
              required
            />
          </div>
        </div>

        {/* Location & Climate */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Location & Climate
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Province */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Province *
              </label>
              <select
                name="province"
                value={formData.province}
                onChange={handleProvinceChange}
                className="input"
                required
              >
                <option value="">Select province</option>
                {Object.keys(provincesAndDistricts).map(province => (
                  <option key={province} value={province}>{province}</option>
                ))}
              </select>
            </div>

            {/* District */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                District *
              </label>
              <select
                name="district"
                value={formData.district}
                onChange={handleInputChange}
                className="input"
                required
                disabled={!formData.province}
              >
                <option value="">Select district</option>
                {availableDistricts.map(district => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
            </div>

            {/* Climate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Climate *
              </label>
              <select
                name="climate"
                value={formData.climate}
                onChange={handleInputChange}
                className="input"
                required
              >
                <option value="">Select climate</option>
                {climateOptions.map(climate => (
                  <option key={climate} value={climate}>{climate}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Recommended Visit Time */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Recommended Time to Visit *
            </label>
            <input
              type="text"
              name="recommendedToVisit"
              value={formData.recommendedToVisit}
              onChange={handleInputChange}
              className="input"
              placeholder="e.g., January to June"
              required
            />
          </div>
        </div>

        {/* Images */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Images (1-6 required)
          </h2>

          {/* Image Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Upload Images
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
                disabled={imageUploading || formData.images.length >= 6}
              />
              <label
                htmlFor="image-upload"
                className={`cursor-pointer ${imageUploading || formData.images.length >= 6 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  {imageUploading ? 'Uploading...' : 'Click to upload images'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                  PNG, JPG, GIF up to 10MB each ({formData.images.length}/6)
                </p>
              </label>
            </div>
          </div>

          {/* Image Preview */}
          {formData.images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {formData.images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image.url}
                    alt={image.alt || `Location image ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Entering Fee */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Entering Fee
          </h2>

          <div className="space-y-4">
            {/* Free Entry Checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="enteringFee.isFree"
                checked={formData.enteringFee.isFree}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Free entry
              </label>
            </div>

            {/* Fee Amount */}
            {!formData.enteringFee.isFree && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Amount
                  </label>
                  <input
                    type="number"
                    name="enteringFee.amount"
                    value={formData.enteringFee.amount}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="Enter amount"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Currency
                  </label>
                  <select
                    name="enteringFee.currency"
                    value={formData.enteringFee.currency}
                    onChange={handleInputChange}
                    className="input"
                  >
                    <option value="LKR">LKR</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Facilities */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Facilities
          </h2>

          {/* Add Facility */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newFacility}
              onChange={(e) => setNewFacility(e.target.value)}
              className="input flex-1"
              placeholder="Enter facility name"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFacility())}
            />
            <button
              type="button"
              onClick={addFacility}
              className="btn-secondary"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Facilities List */}
          {formData.facilities.length > 0 && (
            <div className="space-y-2">
              {formData.facilities.map((facility, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-900 dark:text-white">{facility}</span>
                  <button
                    type="button"
                    onClick={() => removeFacility(index)}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Nearby Activities */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Nearby Activities
          </h2>

          {/* Add Activity */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newActivity}
              onChange={(e) => setNewActivity(e.target.value)}
              className="input flex-1"
              placeholder="Enter nearby activity"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addActivity())}
            />
            <button
              type="button"
              onClick={addActivity}
              className="btn-secondary"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Activities List */}
          {formData.nearbyActivities.length > 0 && (
            <div className="space-y-2">
              {formData.nearbyActivities.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-900 dark:text-white">{activity}</span>
                  <button
                    type="button"
                    onClick={() => removeActivity(index)}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={loading || imageUploading}
          >
            {loading ? 'Saving...' : (location ? 'Update Location' : 'Create Location')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LocationForm;
