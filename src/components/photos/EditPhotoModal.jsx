import { useState } from 'react';
import {
  X,
  Save,
  Loader,
  MapPin,
  Tag,
  ExternalLink,
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  Upload
} from 'lucide-react';
import { adminAPI } from '../../config/api';

const EditPhotoModal = ({ photo, onClose, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    image: photo.image || '',
    caption: photo.caption || '',
    locationName: photo.location?.name || '',
    locationCity: photo.location?.city || '',
    locationProvince: photo.location?.province || '',
    mapLink: photo.mapLink || '',
    tags: photo.tags || [],
    isActive: photo.isActive !== undefined ? photo.isActive : true
  });

  const [tagInput, setTagInput] = useState('');

  const provinces = [
    "Western Province",
    "Central Province",
    "Southern Province",
    "Northern Province",
    "Eastern Province",
    "North Western Province",
    "North Central Province",
    "Uva Province",
    "Sabaragamuwa Province"
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && formData.tags.length < 5) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (index) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const handleImageUpload = () => {
    setUploading(true);

    // Create Cloudinary upload widget
    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: 'daa9e83as',
        uploadPreset: 'ml_default',
        sources: ['local', 'url', 'camera'],
        multiple: false,
        maxFileSize: 10000000, // 10MB
        clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
        resourceType: 'image'
      },
      (error, result) => {
        if (error) {
          console.error('Upload error:', error);
          setError('Failed to upload image');
          setUploading(false);
          return;
        }

        if (result.event === 'success') {
          setFormData(prev => ({
            ...prev,
            image: result.info.secure_url
          }));
          setUploading(false);
          widget.close();
        }

        if (result.event === 'close') {
          setUploading(false);
        }
      }
    );

    widget.open();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate
      if (!formData.caption.trim()) {
        setError('Caption is required');
        setLoading(false);
        return;
      }

      if (!formData.locationName.trim()) {
        setError('Location name is required');
        setLoading(false);
        return;
      }

      const updateData = {
        image: formData.image,
        caption: formData.caption,
        location: {
          name: formData.locationName,
          city: formData.locationCity,
          province: formData.locationProvince
        },
        mapLink: formData.mapLink,
        tags: formData.tags,
        isActive: formData.isActive
      };

      await adminAPI.updateHolidayMemory(photo._id, updateData);
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating photo:', error);
      setError(error.response?.data?.message || 'Failed to update photo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Edit Photo
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <ImageIcon className="w-4 h-4 inline mr-1" />
                Photo Image
              </label>

              {/* Current Image Preview */}
              {formData.image && (
                <div className="mb-3 relative">
                  <img
                    src={formData.image}
                    alt="Current photo"
                    className="w-full h-48 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                  />
                  <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                    Current Image
                  </div>
                </div>
              )}

              {/* Upload Button */}
              <button
                type="button"
                onClick={handleImageUpload}
                disabled={uploading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors bg-gray-50 dark:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {formData.image ? 'Change Image' : 'Upload Image'}
                    </span>
                  </>
                )}
              </button>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Click to upload a new image (JPG, PNG, WEBP - Max 10MB)
              </p>
            </div>

            {/* Caption */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Caption *
              </label>
              <textarea
                name="caption"
                value={formData.caption}
                onChange={handleChange}
                rows="3"
                required
                maxLength="1000"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter caption..."
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {formData.caption.length}/1000 characters
              </p>
            </div>

            {/* Location Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Location Name *
              </label>
              <input
                type="text"
                name="locationName"
                value={formData.locationName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Sigiriya Rock Fortress"
              />
            </div>

            {/* Location City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                City
              </label>
              <input
                type="text"
                name="locationCity"
                value={formData.locationCity}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Dambulla"
              />
            </div>

            {/* Province Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Province
              </label>
              <select
                name="locationProvince"
                value={formData.locationProvince}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Province</option>
                {provinces.map(province => (
                  <option key={province} value={province}>{province}</option>
                ))}
              </select>
            </div>

            {/* Map Link */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <ExternalLink className="w-4 h-4 inline mr-1" />
                Map Link
              </label>
              <input
                type="url"
                name="mapLink"
                value={formData.mapLink}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://maps.google.com/..."
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Tag className="w-4 h-4 inline mr-1" />
                Tags (Max 5)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  disabled={formData.tags.length >= 5}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  placeholder="Enter tag and press Enter"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  disabled={!tagInput.trim() || formData.tags.length >= 5}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Add
                </button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm rounded-full flex items-center gap-2"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(index)}
                        className="hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Is Active */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                {formData.isActive ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Active (Visible to users)
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-red-500" />
                    Inactive (Hidden from users)
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPhotoModal;
