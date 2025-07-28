import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Filter, MapPin, Star, Eye } from 'lucide-react';
import DestinationForm from '../components/destinations/DestinationForm';
import DestinationCard from '../components/destinations/DestinationCard';
import ConfirmDialog from '../components/common/ConfirmDialog';

const DestinationManagement = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDestination, setEditingDestination] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterClimate, setFilterClimate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    byType: {},
    byClimate: {}
  });

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

  useEffect(() => {
    fetchDestinations();
  }, [currentPage, searchTerm, filterType, filterClimate]);

  const fetchDestinations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      const params = new URLSearchParams({
        page: currentPage,
        limit: 12
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (filterType) params.append('type', filterType);
      if (filterClimate) params.append('climate', filterClimate);

      const response = await fetch(`/api/destinations?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDestinations(data.destinations);
        setTotalPages(data.pagination.pages);
        
        // Calculate stats
        const typeStats = {};
        const climateStats = {};
        data.destinations.forEach(dest => {
          typeStats[dest.type] = (typeStats[dest.type] || 0) + 1;
          climateStats[dest.climate] = (climateStats[dest.climate] || 0) + 1;
        });
        
        setStats({
          total: data.pagination.total,
          byType: typeStats,
          byClimate: climateStats
        });
      }
    } catch (error) {
      console.error('Error fetching destinations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDestination = () => {
    setEditingDestination(null);
    setShowForm(true);
  };

  const handleEditDestination = (destination) => {
    setEditingDestination(destination);
    setShowForm(true);
  };

  const handleDeleteDestination = async (destinationId) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/destinations/${destinationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchDestinations();
        setDeleteConfirm(null);
      }
    } catch (error) {
      console.error('Error deleting destination:', error);
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      const token = localStorage.getItem('adminToken');
      const url = editingDestination 
        ? `/api/destinations/${editingDestination._id}`
        : '/api/destinations';
      
      const method = editingDestination ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowForm(false);
        setEditingDestination(null);
        fetchDestinations();
      }
    } catch (error) {
      console.error('Error saving destination:', error);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (type, value) => {
    if (type === 'type') {
      setFilterType(value);
    } else if (type === 'climate') {
      setFilterClimate(value);
    }
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterType('');
    setFilterClimate('');
    setCurrentPage(1);
  };

  if (showForm) {
    return (
      <DestinationForm
        destination={editingDestination}
        onSubmit={handleFormSubmit}
        onCancel={() => {
          setShowForm(false);
          setEditingDestination(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Destination Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage tourist destinations and attractions
          </p>
        </div>
        <button
          onClick={handleAddDestination}
          className="btn-primary flex items-center justify-center space-x-2 w-full sm:w-auto"
        >
          <Plus className="w-5 h-5" />
          <span>Add Destination</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Destinations
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.total}
              </p>
            </div>
            <MapPin className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Most Popular Type
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {Object.keys(stats.byType).length > 0 
                  ? Object.entries(stats.byType).sort(([,a], [,b]) => b - a)[0][0]
                  : 'N/A'
                }
              </p>
            </div>
            <Star className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Climate Zones
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {Object.keys(stats.byClimate).length}
              </p>
            </div>
            <Filter className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Avg. Rating
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {destinations.length > 0 
                  ? (destinations.reduce((sum, dest) => sum + dest.averageRating, 0) / destinations.length).toFixed(1)
                  : '0.0'
                }
              </p>
            </div>
            <Eye className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card p-4 sm:p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col space-y-4">
          {/* Search Bar */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Search destinations..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent transition-colors duration-200"
              />
            </div>
          </div>

          {/* Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={filterType}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent transition-colors duration-200 min-w-[150px]"
            >
              <option value="">All Types</option>
              {destinationTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <select
              value={filterClimate}
              onChange={(e) => handleFilterChange('climate', e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent transition-colors duration-200 min-w-[180px]"
            >
              <option value="">All Climates</option>
              {climateOptions.map(climate => (
                <option key={climate} value={climate}>{climate}</option>
              ))}
            </select>

            {(searchTerm || filterType || filterClimate) && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 rounded-lg border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200 whitespace-nowrap"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Destinations Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : destinations.length === 0 ? (
        <div className="card p-12 text-center">
          <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No destinations found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchTerm || filterType || filterClimate 
              ? 'Try adjusting your search or filters'
              : 'Get started by adding your first destination'
            }
          </p>
          {!searchTerm && !filterType && !filterClimate && (
            <button
              onClick={handleAddDestination}
              className="btn-primary"
            >
              Add First Destination
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {destinations.map((destination) => (
              <DestinationCard
                key={destination._id}
                destination={destination}
                onEdit={() => handleEditDestination(destination)}
                onDelete={() => setDeleteConfirm(destination)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="w-full sm:w-auto btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <span className="text-sm text-gray-600 dark:text-gray-400 text-center">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="w-full sm:w-auto btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <ConfirmDialog
          title="Delete Destination"
          message={`Are you sure you want to delete "${deleteConfirm.name}"? This action cannot be undone.`}
          confirmText="Delete"
          confirmClass="btn-danger"
          onConfirm={() => handleDeleteDestination(deleteConfirm._id)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
};

export default DestinationManagement;
