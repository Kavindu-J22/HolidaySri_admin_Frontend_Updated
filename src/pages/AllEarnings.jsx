import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  Clock, 
  CheckCircle, 
  XCircle, 
  User, 
  Calendar,
  Eye,
  Search,
  Filter,
  TrendingUp,
  DollarSign,
  Gift
} from 'lucide-react';
import { adminAPI } from '../config/api';

const AllEarnings = () => {
  const [earnings, setEarnings] = useState([]);
  const [stats, setStats] = useState({
    pending: { count: 0, totalAmount: 0 },
    processed: { count: 0, totalAmount: 0 },
    paid: { count: 0, totalAmount: 0 },
    total: { count: 0, totalAmount: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [selectedEarning, setSelectedEarning] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    usedPromoCode: '',
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0
  });

  useEffect(() => {
    fetchEarnings();
  }, [filters]);

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllEarnings(filters);
      setEarnings(response.data.earnings);
      setStats(response.data.stats);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Failed to fetch earnings:', error);
    } finally {
      setLoading(false);
    }
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'processed':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'processed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const handleViewDetails = (earning) => {
    setSelectedEarning(earning);
    setShowDetailsModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            All Users Earnings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            View and manage all Users earnings from promo code usage
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-4 sm:p-6 border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-400">Pending</p>
              <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-300">
                {stats.pending.count}
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                {stats.pending.totalAmount.toLocaleString()} LKR
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 sm:p-6 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-800 dark:text-blue-400">Processed</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-300">
                {stats.processed.count}
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-400">
                {stats.processed.totalAmount.toLocaleString()} LKR
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 sm:p-6 border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-800 dark:text-green-400">Paid</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-300">
                {stats.paid.count}
              </p>
              <p className="text-sm text-green-700 dark:text-green-400">
                {stats.paid.totalAmount.toLocaleString()} LKR
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 sm:p-6 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-800 dark:text-purple-400">Total Earnings</p>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-300">
                {stats.total.count}
              </p>
              <p className="text-sm text-purple-700 dark:text-purple-400">
                {stats.total.totalAmount.toLocaleString()} LKR
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by email..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div className="relative">
            <Gift className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Filter by promo code..."
              value={filters.usedPromoCode}
              onChange={(e) => setFilters(prev => ({ ...prev, usedPromoCode: e.target.value, page: 1 }))}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processed">Processed</option>
              <option value="paid">Paid</option>
            </select>
          </div>

          <button
            onClick={() => setFilters({
              status: 'all',
              search: '',
              usedPromoCode: '',
              page: 1,
              limit: 20,
              sortBy: 'createdAt',
              sortOrder: 'desc'
            })}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Earnings Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Buyer Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Promo Code
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Code Owner
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-3">Loading earnings...</span>
                    </div>
                  </td>
                </tr>
              ) : earnings.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    No earnings found
                  </td>
                </tr>
              ) : (
                earnings.map((earning) => (
                  <tr key={earning._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                      {formatDate(earning.createdAt)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                      {earning.buyerEmail}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-blue-600 dark:text-blue-400">
                      {earning.usedPromoCode}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                      {earning.usedPromoCodeOwner}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-300">
                      <div className="max-w-xs truncate" title={earning.item}>
                        {earning.item}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {earning.itemType}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-300">
                      {earning.amount.toLocaleString()} LKR
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(earning.status)}`}>
                        {getStatusIcon(earning.status)}
                        <span className="ml-1 capitalize">{earning.status}</span>
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleViewDetails(earning)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing page {pagination.page} of {pagination.pages} ({pagination.total} total)
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setFilters(prev => ({ ...prev, page: Math.min(pagination.pages, prev.page + 1) }))}
                  disabled={pagination.page === pagination.pages}
                  className="px-3 py-1 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedEarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Earning Details
                </h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedEarning.status)}`}>
                  {getStatusIcon(selectedEarning.status)}
                  <span className="ml-1 capitalize">{selectedEarning.status}</span>
                </span>
              </div>

              {/* Amount */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Amount</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {selectedEarning.amount.toLocaleString()} LKR
                </span>
              </div>

              {/* Buyer Information */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Buyer Information</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Email</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedEarning.buyerEmail}</span>
                  </div>
                  {selectedEarning.buyerId && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Name</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedEarning.buyerId.name}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Promo Code Information */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Promo Code Information</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Promo Code</span>
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{selectedEarning.usedPromoCode}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Code Owner Email</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedEarning.usedPromoCodeOwner}</span>
                  </div>
                  {selectedEarning.usedPromoCodeOwnerId && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Code Owner Name</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedEarning.usedPromoCodeOwnerId.name}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Item Information */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Item Information</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Category</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedEarning.category}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Item Type</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedEarning.itemType}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">Item</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedEarning.item}</span>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Timeline</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Created</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(selectedEarning.createdAt)}</span>
                  </div>
                  {selectedEarning.processedAt && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Processed</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(selectedEarning.processedAt)}</span>
                    </div>
                  )}
                  {selectedEarning.paidAt && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Paid</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(selectedEarning.paidAt)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllEarnings;

