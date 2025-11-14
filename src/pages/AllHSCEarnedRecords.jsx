import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle, 
  User, 
  CreditCard, 
  Calendar,
  Package,
  Eye,
  TrendingUp,
  FileText,
  Search,
  Filter,
  Database,
  Mail,
  ShoppingCart
} from 'lucide-react';
import { adminAPI } from '../config/api';

const AllHSCEarnedRecords = () => {
  const [hscEarnedRecords, setHscEarnedRecords] = useState([]);
  const [stats, setStats] = useState({
    pending: { count: 0, totalAmount: 0 },
    completed: { count: 0, totalAmount: 0 },
    cancelled: { count: 0, totalAmount: 0 },
    'paid As HSC': { count: 0, totalAmount: 0 },
    'paid As LKR': { count: 0, totalAmount: 0 },
    total: { count: 0, totalAmount: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    search: '',
    startDate: '',
    endDate: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  useEffect(() => {
    fetchHSCEarnedRecords();
  }, [filters, pagination.page]);

  const fetchHSCEarnedRecords = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllHSCEarnedRecords({
        ...filters,
        page: pagination.page,
        limit: pagination.limit
      });
      
      setHscEarnedRecords(response.data.hscEarnedRecords || []);
      setStats(response.data.stats || {});
      setPagination(prev => ({
        ...prev,
        total: response.data.pagination.total,
        pages: response.data.pagination.pages
      }));
    } catch (error) {
      console.error('Failed to fetch HSC earned records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchHSCEarnedRecords();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'paid As HSC':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'paid As LKR':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      case 'paid As HSC':
      case 'paid As LKR':
        return <DollarSign className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const viewDetails = (record) => {
    setSelectedRecord(record);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedRecord(null);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Database className="w-8 h-8" />
            All Users HSC Earn Records
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View and manage all HSC earned records from users
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending?.count || 0}</p>
              <p className="text-xs text-gray-500">LKR {(stats.pending?.totalAmount || 0).toFixed(2)}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed?.count || 0}</p>
              <p className="text-xs text-gray-500">LKR {(stats.completed?.totalAmount || 0).toFixed(2)}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Cancelled</p>
              <p className="text-2xl font-bold text-red-600">{stats.cancelled?.count || 0}</p>
              <p className="text-xs text-gray-500">LKR {(stats.cancelled?.totalAmount || 0).toFixed(2)}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Paid As HSC</p>
              <p className="text-2xl font-bold text-blue-600">{stats['paid As HSC']?.count || 0}</p>
              <p className="text-xs text-gray-500">LKR {(stats['paid As HSC']?.totalAmount || 0).toFixed(2)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Paid As LKR</p>
              <p className="text-2xl font-bold text-purple-600">{stats['paid As LKR']?.count || 0}</p>
              <p className="text-xs text-gray-500">LKR {(stats['paid As LKR']?.totalAmount || 0).toFixed(2)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-2xl font-bold text-indigo-600">{stats.total?.count || 0}</p>
              <p className="text-xs text-gray-500">LKR {(stats.total?.totalAmount || 0).toFixed(2)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-indigo-500" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Search className="w-4 h-4 inline mr-1" />
              Search
            </label>
            <form onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search by email, name, promo code, or transaction ID..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              />
            </form>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Filter className="w-4 h-4 inline mr-1" />
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="paid As HSC">Paid As HSC</option>
              <option value="paid As LKR">Paid As LKR</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Package className="w-4 h-4 inline mr-1" />
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Categories</option>
              <option value="Promocode Sold">Promocode Sold</option>
              <option value="Referral Bonus">Referral Bonus</option>
              <option value="Advertisement Revenue">Advertisement Revenue</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Buyer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Promo Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Amount (LKR)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                      <span className="ml-3 text-gray-600 dark:text-gray-400">Loading records...</span>
                    </div>
                  </td>
                </tr>
              ) : hscEarnedRecords.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    No HSC earned records found
                  </td>
                </tr>
              ) : (
                hscEarnedRecords.map((record) => (
                  <tr key={record._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="w-5 h-5 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {record.userId?.name || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {record.userId?.email || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <ShoppingCart className="w-5 h-5 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {record.buyerDetails?.buyerName || record.buyerUserId?.name || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {record.buyerDetails?.buyerEmail || record.buyerUserId?.email || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                        {record.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {record.itemDetails?.promoCode || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {record.itemDetails?.promoCodeType || ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-green-600 dark:text-green-400">
                        LKR {record.earnedAmount?.toFixed(2) || '0.00'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {record.itemDetails?.sellingPriceLKR ? `(${record.itemDetails.sellingPriceLKR.toFixed(2)})` : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full ${getStatusColor(record.status)}`}>
                        {getStatusIcon(record.status)}
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900 dark:text-white">
                        <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                        {formatDate(record.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => viewDetails(record)}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && hscEarnedRecords.length > 0 && (
          <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                disabled={pagination.page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
                disabled={pagination.page === pagination.pages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span> of{' '}
                  <span className="font-medium">{pagination.total}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                    disabled={pagination.page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
                    disabled={pagination.page === pagination.pages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-6 h-6" />
                  HSC Earned Record Details
                </h2>
                <button
                  onClick={closeDetailsModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Status */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Status</h3>
                  <span className={`px-3 py-1 inline-flex items-center gap-2 text-sm font-semibold rounded-full ${getStatusColor(selectedRecord.status)}`}>
                    {getStatusIcon(selectedRecord.status)}
                    {selectedRecord.status}
                  </span>
                </div>

                {/* User Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
                      <User className="w-4 h-4" />
                      User (Earner)
                    </h3>
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedRecord.userId?.name || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-1">
                        <Mail className="w-3 h-3" />
                        {selectedRecord.userId?.email || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
                      <ShoppingCart className="w-4 h-4" />
                      Buyer
                    </h3>
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedRecord.buyerDetails?.buyerName || selectedRecord.buyerUserId?.name || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-1">
                        <Mail className="w-3 h-3" />
                        {selectedRecord.buyerDetails?.buyerEmail || selectedRecord.buyerUserId?.email || 'N/A'}
                      </p>
                      {selectedRecord.buyerDetails?.purchaseDate && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Purchase: {formatDate(selectedRecord.buyerDetails.purchaseDate)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Earning Details */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    Earning Details
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Category:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedRecord.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Earned Amount:</span>
                      <span className="text-sm font-bold text-green-600 dark:text-green-400">
                        HSC {selectedRecord.earnedAmount?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Transaction ID:</span>
                      <span className="text-sm font-mono text-gray-900 dark:text-white">{selectedRecord.transactionId}</span>
                    </div>
                  </div>
                </div>

                {/* Item Details */}
                {selectedRecord.itemDetails && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
                      <Package className="w-4 h-4" />
                      Item Details
                    </h3>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Promo Code:</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {selectedRecord.itemDetails.promoCode}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Type:</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                          {selectedRecord.itemDetails.promoCodeType}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Selling Price:</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {selectedRecord.itemDetails.sellingPrice} HSC
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Selling Price (LKR):</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          LKR {selectedRecord.itemDetails.sellingPriceLKR?.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Description */}
                {selectedRecord.description && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Description</h3>
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <p className="text-sm text-gray-900 dark:text-white">{selectedRecord.description}</p>
                    </div>
                  </div>
                )}

                {/* Timestamps */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Timestamps
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Created:</span>
                      <span className="text-sm text-gray-900 dark:text-white">{formatDate(selectedRecord.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Updated:</span>
                      <span className="text-sm text-gray-900 dark:text-white">{formatDate(selectedRecord.updatedAt)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={closeDetailsModal}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllHSCEarnedRecords;

