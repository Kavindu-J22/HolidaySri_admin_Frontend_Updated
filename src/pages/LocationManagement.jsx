import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Filter, MapPin, Star, Eye } from 'lucide-react';
import LocationForm from '../components/locations/LocationForm';
import LocationCard from '../components/locations/LocationCard';
import ConfirmDialog from '../components/common/ConfirmDialog';

const LocationManagement = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
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

  // Location types and climate options
  const [locationTypes, setLocationTypes] = useState([]);
  const [climateOptions, setClimateOptions] = useState([]);

  useEffect(() => {
    fetchConstants();
    fetchLocations();
  }, [currentPage, searchTerm, filterType, filterClimate]);

  const fetchConstants = async () => {
    try {
      const response = await fetch('/api/locations/constants');
      if (response.ok) {
        const data = await response.json();
        setLocationTypes(data.locationTypes);
        setClimateOptions(data.climateOptions);
      }
    } catch (error) {
      console.error('Error fetching constants:', error);
    }
  };

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 12
      });

      if (searchTerm) params.append('search', searchTerm);
      if (filterType) params.append('locationType', filterType);
      if (filterClimate) params.append('climate', filterClimate);

      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/locations?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLocations(data.locations);
        setTotalPages(data.pagination.pages);
        
        // Calculate stats
        const typeStats = {};
        const climateStats = {};
        data.locations.forEach(location => {
          typeStats[location.locationType] = (typeStats[location.locationType] || 0) + 1;
          climateStats[location.climate] = (climateStats[location.climate] || 0) + 1;
        });
        
        setStats({
          total: data.pagination.total,
          byType: typeStats,
          byClimate: climateStats
        });
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLocation = () => {
    setEditingLocation(null);
    setShowForm(true);
  };

  const handleEditLocation = (location) => {
    setEditingLocation(location);
    setShowForm(true);
  };

  const handleDeleteLocation = async (locationId) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/locations/${locationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setDeleteConfirm(null);
        fetchLocations();
      }
    } catch (error) {
      console.error('Error deleting location:', error);
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      const token = localStorage.getItem('adminToken');
      const url = editingLocation 
        ? `/api/locations/${editingLocation._id}`
        : '/api/locations';
      
      const method = editingLocation ? 'PUT' : 'POST';

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
        setEditingLocation(null);
        fetchLocations();
      }
    } catch (error) {
      console.error('Error saving location:', error);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleTypeFilter = (e) => {
    setFilterType(e.target.value);
    setCurrentPage(1);
  };

  const handleClimateFilter = (e) => {
    setFilterClimate(e.target.value);
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
      <LocationForm
        location={editingLocation}
        onSubmit={handleFormSubmit}
        onCancel={() => {
          setShowForm(false);
          setEditingLocation(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Location Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage tourist locations and attractions
          </p>
        </div>
        <button
          onClick={handleAddLocation}
          className="btn-primary"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Location
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Locations
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.total}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Location Types
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {Object.keys(stats.byType).length}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
              <Filter className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
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
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
              <Star className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Avg Rating
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {locations.length > 0 
                  ? (locations.reduce((sum, loc) => sum + loc.averageRating, 0) / locations.length).toFixed(1)
                  : '0.0'
                }
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
              <Star className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search locations..."
                value={searchTerm}
                onChange={handleSearch}
                className="input pl-10"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div className="w-full lg:w-64">
            <select
              value={filterType}
              onChange={handleTypeFilter}
              className="input"
            >
              <option value="">All Types</option>
              {locationTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Climate Filter */}
          <div className="w-full lg:w-64">
            <select
              value={filterClimate}
              onChange={handleClimateFilter}
              className="input"
            >
              <option value="">All Climates</option>
              {climateOptions.map(climate => (
                <option key={climate} value={climate}>{climate}</option>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          {(searchTerm || filterType || filterClimate) && (
            <button
              onClick={clearFilters}
              className="btn-secondary whitespace-nowrap"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : locations.length === 0 ? (
        /* Empty State */
        <div className="text-center py-12">
          <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No locations found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchTerm || filterType || filterClimate 
              ? 'Try adjusting your search or filters'
              : 'Get started by adding your first location'
            }
          </p>
          {!searchTerm && !filterType && !filterClimate && (
            <button
              onClick={handleAddLocation}
              className="btn-primary"
            >
              Add First Location
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Locations Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {locations.map((location) => (
              <LocationCard
                key={location._id}
                location={location}
                onEdit={() => handleEditLocation(location)}
                onDelete={() => setDeleteConfirm(location)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-4">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <div className="flex items-center space-x-2">
                {[...Array(Math.min(5, totalPages))].map((_, index) => {
                  const pageNum = currentPage <= 3 
                    ? index + 1 
                    : currentPage + index - 2;
                  
                  if (pageNum > totalPages) return null;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
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
          title="Delete Location"
          message={`Are you sure you want to delete "${deleteConfirm.name}"? This action cannot be undone.`}
          confirmText="Delete"
          confirmClass="btn-danger"
          onConfirm={() => handleDeleteLocation(deleteConfirm._id)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
};

export default LocationManagement;
