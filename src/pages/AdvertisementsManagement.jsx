import { useState, useEffect } from 'react';
import {
  Megaphone,
  Search,
  Eye,
  ExternalLink,
  Power,
  Trash2,
  RefreshCw,
  X,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Filter
} from 'lucide-react';
import { adminAPI } from '../config/api';

const AdvertisementsManagement = () => {
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isActiveFilter, setIsActiveFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAds, setTotalAds] = useState(0);

  // Modals
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAd, setSelectedAd] = useState(null);
  const [adDetails, setAdDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Delete confirmation
  const [deleteSlotId, setDeleteSlotId] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Category mapping
  const categoryNames = {
    'travel_buddys': 'Travel Buddies',
    'tour_guiders': 'Tour Guiders',
    'local_tour_packages': 'Local Tour Packages',
    'travelsafe_help_professionals': 'Travel Safe Help Professionals',
    'rent_land_camping_parking': 'Rent Land Camping Parking',
    'hotels_accommodations': 'Hotels & Accommodations',
    'cafes_restaurants': 'Cafes & Restaurants',
    'foods_beverages': 'Foods & Beverages',
    'vehicle_rentals_hire': 'Vehicle Rentals & Hire',
    'professional_drivers': 'Professional Drivers',
    'vehicle_repairs_mechanics': 'Vehicle Repairs & Mechanics',
    'event_planners_coordinators': 'Event Planners & Coordinators',
    'creative_photographers': 'Creative Photographers',
    'decorators_florists': 'Decorators & Florists',
    'salon_makeup_artists': 'Salon & Makeup Artists',
    'fashion_designers': 'Fashion Designers',
    'fashion_beauty_clothing': 'Fashion Beauty & Clothing',
    'expert_doctors': 'Expert Doctors',
    'professional_lawyers': 'Professional Lawyers',
    'advisors_counselors': 'Advisors & Counselors',
    'expert_architects': 'Expert Architects',
    'trusted_astrologists': 'Trusted Astrologists',
    'delivery_partners': 'Delivery Partners',
    'graphics_it_tech_repair': 'Graphics IT & Tech Repair',
    'educational_tutoring': 'Educational Tutoring',
    'babysitters_childcare': 'Babysitters & Childcare',
    'pet_care_animal_services': 'Pet Care & Animal Services',
    'rent_property_buying_selling': 'Rent Property Buying Selling',
    'books_magazines_educational': 'Books Magazines & Educational',
    'other_items': 'Other Items',
    'events_updates': 'Events & Updates',
    'donations_raise_fund': 'Donations & Raise Fund',
    'home_banner_slot': 'Home Banner Slot',
    'live_rides_carpooling': 'Live Rides & Carpooling',
    'crypto_consulting_signals': 'Crypto Consulting & Signals'
  };

  // Fetch advertisements
  const fetchAdvertisements = async () => {
    try {
      setLoading(true);

      const params = {
        page: currentPage,
        limit: 20,
        search: searchTerm,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        isActive: isActiveFilter !== 'all' ? isActiveFilter : undefined
      };

      const response = await adminAPI.getAdvertisements(params);
      
      setAdvertisements(response.data.advertisements || []);
      setTotalPages(response.data.totalPages || 1);
      setTotalAds(response.data.total || 0);
      setError('');
    } catch (error) {
      console.error('Error fetching advertisements:', error);
      setError('Failed to fetch advertisements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvertisements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm, categoryFilter, statusFilter, isActiveFilter]);

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Handle filter changes
  const handleCategoryFilter = (e) => {
    setCategoryFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleIsActiveFilter = (e) => {
    setIsActiveFilter(e.target.value);
    setCurrentPage(1);
  };

  // View details
  const handleViewDetails = async (ad) => {
    setSelectedAd(ad);
    setShowDetailModal(true);
    setLoadingDetails(true);

    try {
      const response = await adminAPI.getAdvertisementDetails(ad._id);
      setAdDetails(response.data);
    } catch (error) {
      console.error('Error fetching advertisement details:', error);
      setError('Failed to fetch advertisement details');
    } finally {
      setLoadingDetails(false);
    }
  };

  // View ad on site
  const handleViewAdOnSite = (ad) => {
    const categoryRouteMap = {
      'travel_buddys': `/travel-buddy/${ad.publishedAdId}`,
      'tour_guiders': `/tour-guider/${ad.publishedAdId}`,
      'local_tour_packages': `/local-tour-package/${ad.publishedAdId}`,
      'travelsafe_help_professionals': `/travel-safe-help-professional/${ad.publishedAdId}`,
      'rent_land_camping_parking': `/rent-land-camping-parking/${ad.publishedAdId}`,
      'hotels_accommodations': `/hotels-accommodations/${ad.publishedAdId}`,
      'cafes_restaurants': `/cafes-restaurants/${ad.publishedAdId}`,
      'foods_beverages': `/foods-beverages/${ad.publishedAdId}`,
      'vehicle_rentals_hire': `/vehicle-rentals-hire/${ad.publishedAdId}`,
      'professional_drivers': `/professional-drivers/${ad.publishedAdId}`,
      'vehicle_repairs_mechanics': `/vehicle-repairs-mechanics/${ad.publishedAdId}`,
      'event_planners_coordinators': `/event-planners-coordinators/${ad.publishedAdId}`,
      'creative_photographers': `/creative-photographers/${ad.publishedAdId}`,
      'decorators_florists': `/decorators-florists/${ad.publishedAdId}`,
      'salon_makeup_artists': `/salon-makeup-artists/${ad.publishedAdId}`,
      'fashion_designers': `/fashion-designers/${ad.publishedAdId}`,
      'fashion_beauty_clothing': `/fashion-beauty-clothing/${ad.publishedAdId}`,
      'expert_doctors': `/expert-doctors/${ad.publishedAdId}`,
      'professional_lawyers': `/professional-lawyers/${ad.publishedAdId}`,
      'advisors_counselors': `/advisors-counselors/${ad.publishedAdId}`,
      'expert_architects': `/expert-architects/${ad.publishedAdId}`,
      'trusted_astrologists': `/trusted-astrologists/${ad.publishedAdId}`,
      'delivery_partners': `/delivery-partners/${ad.publishedAdId}`,
      'graphics_it_tech_repair': `/graphics-it-tech-repair/${ad.publishedAdId}`,
      'educational_tutoring': `/educational-tutoring/${ad.publishedAdId}`,
      'babysitters_childcare': `/babysitters-childcare/${ad.publishedAdId}`,
      'pet_care_animal_services': `/pet-care-animal-services/${ad.publishedAdId}`,
      'rent_property_buying_selling': `/rent-property-buying-selling/${ad.publishedAdId}`,
      'books_magazines_educational': `/books-magazines-educational/${ad.publishedAdId}`,
      'other_items': `/other-items/${ad.publishedAdId}`,
      'events_updates': `/events-updates/${ad.publishedAdId}`,
      'donations_raise_fund': `/donations-raise-fund/${ad.publishedAdId}`,
      'home_banner_slot': `/`,
      'live_rides_carpooling': `/live-rides-carpooling/${ad.publishedAdId}`,
      'crypto_consulting_signals': `/crypto-consulting-signals/${ad.publishedAdId}`
    };

    const route = categoryRouteMap[ad.category];
    if (route) {
      const clientUrl = import.meta.env.VITE_CLIENT_URL || 'https://www.holidaysri.com';
      window.open(`${clientUrl}${route}`, '_blank');
    } else {
      setError('Unable to navigate to this advertisement type');
    }
  };

  // Toggle isActive
  const handleToggleActive = async (ad) => {
    if (!window.confirm(`Are you sure you want to ${ad.isActive ? 'deactivate' : 'activate'} this advertisement?`)) {
      return;
    }

    try {
      await adminAPI.toggleAdvertisementActive(ad._id);
      setSuccessMessage(`Advertisement ${!ad.isActive ? 'activated' : 'deactivated'} successfully`);
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchAdvertisements();
    } catch (error) {
      console.error('Error toggling advertisement status:', error);
      setError('Failed to update advertisement status');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Open delete modal
  const handleOpenDeleteModal = (ad) => {
    setSelectedAd(ad);
    setShowDeleteModal(true);
    setDeleteSlotId('');
    setAdminNote('');
  };

  // Delete advertisement
  const handleDeleteAdvertisement = async () => {
    if (!selectedAd) return;

    if (deleteSlotId !== selectedAd.slotId) {
      setError('Slot ID does not match. Please enter the correct Slot ID.');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (!adminNote.trim()) {
      setError('Please provide an admin note explaining the reason for deletion.');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      setDeleting(true);
      await adminAPI.deleteAdvertisement(selectedAd._id, deleteSlotId, adminNote);
      setSuccessMessage('Advertisement deleted successfully and user has been notified');
      setTimeout(() => setSuccessMessage(''), 3000);
      setShowDeleteModal(false);
      setSelectedAd(null);
      setDeleteSlotId('');
      setAdminNote('');
      fetchAdvertisements();
    } catch (error) {
      console.error('Error deleting advertisement:', error);
      setError(error.response?.data?.message || 'Failed to delete advertisement');
      setTimeout(() => setError(''), 3000);
    } finally {
      setDeleting(false);
    }
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Published':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'active':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'expired':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Advertisements Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View and manage all user advertisements
          </p>
        </div>
        <button
          onClick={fetchAdvertisements}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-4 py-3 rounded-lg flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          {successMessage}
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg flex items-center">
          <XCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Ads</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalAds}</p>
            </div>
            <Megaphone className="w-8 h-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by email or Slot ID..."
                value={searchTerm}
                onChange={handleSearch}
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={handleCategoryFilter}
              className="input-field"
            >
              <option value="all">All Categories</option>
              {Object.entries(categoryNames).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={handleStatusFilter}
              className="input-field"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="Published">Published</option>
              <option value="paused">Paused</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          {/* isActive Filter */}
          <div>
            <select
              value={isActiveFilter}
              onChange={handleIsActiveFilter}
              className="input-field"
            >
              <option value="all">All Active Status</option>
              <option value="true">Active Only</option>
              <option value="false">Inactive Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Advertisements Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Slot ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Active
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="loading-spinner"></div>
                    </div>
                  </td>
                </tr>
              ) : advertisements.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    No advertisements found
                  </td>
                </tr>
              ) : (
                advertisements.map((ad) => (
                  <tr key={ad._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {ad.slotId}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {ad.userId?.name || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {ad.userId?.email || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 dark:text-white">
                        {categoryNames[ad.category] || ad.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(ad.status)}`}>
                        {ad.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {ad.isActive ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(ad.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {/* View Details */}
                        <button
                          onClick={() => handleViewDetails(ad)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>

                        {/* View on Site */}
                        {ad.publishedAdId && (
                          <button
                            onClick={() => handleViewAdOnSite(ad)}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                            title="View Ad on Site"
                          >
                            <ExternalLink className="w-5 h-5" />
                          </button>
                        )}

                        {/* Toggle Active */}
                        <button
                          onClick={() => handleToggleActive(ad)}
                          className={`${ad.isActive ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'} dark:text-yellow-400 dark:hover:text-yellow-300`}
                          title={ad.isActive ? 'Deactivate' : 'Activate'}
                        >
                          <Power className="w-5 h-5" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleOpenDeleteModal(ad)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title="Delete Advertisement"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Previous
          </button>
          <span className="text-gray-700 dark:text-gray-300">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Next
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedAd && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Advertisement Details
                </h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {loadingDetails ? (
                <div className="flex justify-center py-12">
                  <div className="loading-spinner"></div>
                </div>
              ) : adDetails ? (
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Slot ID</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">{adDetails.advertisement.slotId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Category</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {categoryNames[adDetails.advertisement.category] || adDetails.advertisement.category}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                      <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadgeColor(adDetails.advertisement.status)}`}>
                        {adDetails.advertisement.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Active Status</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {adDetails.advertisement.isActive ? (
                          <span className="text-green-600">Active</span>
                        ) : (
                          <span className="text-red-600">Inactive</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">User Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Name</p>
                        <p className="text-base text-gray-900 dark:text-white">{adDetails.advertisement.userId?.name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                        <p className="text-base text-gray-900 dark:text-white">{adDetails.advertisement.userId?.email || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Payment Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Plan</p>
                        <p className="text-base text-gray-900 dark:text-white capitalize">{adDetails.advertisement.selectedPlan}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Payment Method</p>
                        <p className="text-base text-gray-900 dark:text-white">{adDetails.advertisement.paymentMethod}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Original Amount</p>
                        <p className="text-base text-gray-900 dark:text-white">{adDetails.advertisement.originalAmount} {adDetails.advertisement.paymentMethod}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Final Amount</p>
                        <p className="text-base font-semibold text-gray-900 dark:text-white">{adDetails.advertisement.finalAmount} {adDetails.advertisement.paymentMethod}</p>
                      </div>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Dates</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Created At</p>
                        <p className="text-base text-gray-900 dark:text-white">{formatDate(adDetails.advertisement.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Published At</p>
                        <p className="text-base text-gray-900 dark:text-white">{formatDate(adDetails.advertisement.publishedAt)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Expires At</p>
                        <p className="text-base text-gray-900 dark:text-white">{formatDate(adDetails.advertisement.expiresAt)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Promo Code Info */}
                  {adDetails.advertisement.usedPromoCode && (
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Promo Code Used</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Promo Code</p>
                          <p className="text-base text-gray-900 dark:text-white">{adDetails.advertisement.usedPromoCode}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Discount Amount</p>
                          <p className="text-base text-gray-900 dark:text-white">{adDetails.advertisement.discountAmount} {adDetails.advertisement.paymentMethod}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400">No details available</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedAd && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>

              <h2 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
                Delete Advertisement
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                This action cannot be undone. The advertisement and all associated content will be permanently deleted.
              </p>

              <div className="space-y-4">
                {/* Slot ID Confirmation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirm Slot ID: <span className="text-red-600">{selectedAd.slotId}</span>
                  </label>
                  <input
                    type="text"
                    value={deleteSlotId}
                    onChange={(e) => setDeleteSlotId(e.target.value.toUpperCase())}
                    placeholder="Enter Slot ID to confirm"
                    className="input-field"
                  />
                </div>

                {/* Admin Note */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Admin Note <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="Explain the reason for deletion (will be sent to user via email)"
                    rows="4"
                    className="input-field"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    This note will be included in the email notification sent to the user.
                  </p>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteSlotId('');
                    setAdminNote('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAdvertisement}
                  disabled={deleting || deleteSlotId !== selectedAd.slotId || !adminNote.trim()}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? 'Deleting...' : 'Delete Advertisement'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvertisementsManagement;

