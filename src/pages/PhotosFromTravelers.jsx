import { useState, useEffect } from 'react';
import {
  Camera,
  Search,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  MapPin,
  Heart,
  MessageSquare,
  Download,
  Calendar,
  User,
  Filter,
  X,
  CheckCircle,
  XCircle,
  Tag,
  AlertTriangle
} from 'lucide-react';
import { adminAPI } from '../config/api';
import ViewPhotoModal from '../components/photos/ViewPhotoModal';
import EditPhotoModal from '../components/photos/EditPhotoModal';
import DeletePhotoModal from '../components/photos/DeletePhotoModal';

const PhotosFromTravelers = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [provinceFilter, setProvinceFilter] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPhotos, setTotalPhotos] = useState(0);

  // Modals
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

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

  // Fetch photos
  const fetchPhotos = async () => {
    try {
      setLoading(true);
      setError('');

      const params = {
        page: currentPage,
        limit: 12,
        search: searchTerm,
        province: provinceFilter,
        isActive: isActiveFilter !== 'all' ? isActiveFilter === 'active' : undefined
      };

      const response = await adminAPI.getHolidayMemories(params);
      setPhotos(response.data.photos || []);
      setTotalPages(response.data.totalPages || 1);
      setTotalPhotos(response.data.totalPhotos || 0);
    } catch (error) {
      console.error('Error fetching photos:', error);
      setError(error.response?.data?.message || 'Failed to fetch photos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, [currentPage, searchTerm, provinceFilter, isActiveFilter]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleProvinceFilter = (e) => {
    setProvinceFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleIsActiveFilter = (e) => {
    setIsActiveFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleView = (photo) => {
    setSelectedPhoto(photo);
    setShowViewModal(true);
  };

  const handleEdit = (photo) => {
    setSelectedPhoto(photo);
    setShowEditModal(true);
  };

  const handleDelete = (photo) => {
    setSelectedPhoto(photo);
    setShowDeleteModal(true);
  };

  const handlePhotoUpdated = () => {
    setSuccessMessage('Photo updated successfully');
    setTimeout(() => setSuccessMessage(''), 3000);
    fetchPhotos();
  };

  const handlePhotoDeleted = () => {
    setSuccessMessage('Photo deleted successfully and user has been notified');
    setTimeout(() => setSuccessMessage(''), 3000);
    fetchPhotos();
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Camera className="w-7 h-7" />
            Photos from Travelers
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage holiday memories shared by travelers
          </p>
        </div>
        <button
          onClick={fetchPhotos}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-4 py-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage('')}>
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <XCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')}>
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Photos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalPhotos}</p>
            </div>
            <Camera className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Current Page</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{currentPage} / {totalPages}</p>
            </div>
            <Filter className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Showing</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{photos.length} photos</p>
            </div>
            <Eye className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Search by caption, location, tags..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Province Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Province
            </label>
            <select
              value={provinceFilter}
              onChange={handleProvinceFilter}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Provinces</option>
              {provinces.map(province => (
                <option key={province} value={province}>{province}</option>
              ))}
            </select>
          </div>

          {/* Active Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              value={isActiveFilter}
              onChange={handleIsActiveFilter}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Photos Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : photos.length === 0 ? (
        <div className="card p-12 text-center">
          <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Photos Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchTerm || provinceFilter || isActiveFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'No photos have been uploaded yet'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {photos.map((photo) => (
              <div
                key={photo._id}
                className="card overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col"
              >
                {/* Image */}
                <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
                  <img
                    src={photo.image}
                    alt={photo.caption}
                    className="w-full h-full object-cover"
                  />
                  {/* Status Badge */}
                  <div className="absolute top-2 right-2">
                    {photo.isActive ? (
                      <span className="px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        Inactive
                      </span>
                    )}
                  </div>
                </div>

                {/* Content - flex-grow to push buttons to bottom */}
                <div className="p-4 flex-grow flex flex-col">
                  {/* Caption */}
                  <p className="text-sm text-gray-900 dark:text-white font-medium mb-2 line-clamp-2">
                    {photo.caption}
                  </p>

                  {/* Location */}
                  <div className="flex items-center text-xs text-gray-600 dark:text-gray-400 mb-2">
                    <MapPin className="w-3 h-3 mr-1" />
                    <span className="line-clamp-1">
                      {photo.location?.name}
                      {photo.location?.province && `, ${photo.location.province}`}
                    </span>
                  </div>

                  {/* User */}
                  <div className="flex items-center text-xs text-gray-600 dark:text-gray-400 mb-3">
                    <User className="w-3 h-3 mr-1" />
                    <span className="line-clamp-1">{photo.userName}</span>
                  </div>

                  {/* Tags */}
                  {photo.tags && photo.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {photo.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full flex items-center gap-1"
                        >
                          <Tag className="w-2.5 h-2.5" />
                          {tag}
                        </span>
                      ))}
                      {photo.tags.length > 3 && (
                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                          +{photo.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5" />
                        <span>{photo.likes?.length || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{photo.comments?.length || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Download className="w-3.5 h-3.5" />
                        <span>{photo.downloads?.length || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Reports Count */}
                  {photo.reports && photo.reports.length > 0 && (
                    <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <div className="flex items-center gap-2 text-xs text-red-700 dark:text-red-300">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span className="font-semibold">{photo.reports.length} Report{photo.reports.length > 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  )}

                  {/* Date */}
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-3">
                    <Calendar className="w-3 h-3 mr-1" />
                    <span>{formatDate(photo.createdAt)}</span>
                  </div>

                  {/* Spacer to push buttons to bottom */}
                  <div className="flex-grow"></div>

                  {/* Actions - Always at bottom */}
                  <div className="flex items-center gap-2 mt-auto">
                    <button
                      onClick={() => handleView(photo)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View
                    </button>
                    <button
                      onClick={() => handleEdit(photo)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(photo)}
                      className="flex items-center justify-center gap-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Previous
              </button>
              <span className="text-gray-700 dark:text-gray-300">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      {showViewModal && selectedPhoto && (
        <ViewPhotoModal
          photo={selectedPhoto}
          onClose={() => {
            setShowViewModal(false);
            setSelectedPhoto(null);
          }}
          onUpdate={handlePhotoUpdated}
        />
      )}

      {showEditModal && selectedPhoto && (
        <EditPhotoModal
          photo={selectedPhoto}
          onClose={() => {
            setShowEditModal(false);
            setSelectedPhoto(null);
          }}
          onUpdate={handlePhotoUpdated}
        />
      )}

      {showDeleteModal && selectedPhoto && (
        <DeletePhotoModal
          photo={selectedPhoto}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedPhoto(null);
          }}
          onDelete={handlePhotoDeleted}
        />
      )}
    </div>
  );
};

export default PhotosFromTravelers;

