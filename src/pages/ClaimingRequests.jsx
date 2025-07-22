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
  Check,
  AlertCircle,
  TrendingUp,
  FileText,
  Search,
  Filter
} from 'lucide-react';
import { adminAPI } from '../config/api';

const ClaimingRequests = () => {
  const [claimRequests, setClaimRequests] = useState([]);
  const [stats, setStats] = useState({
    pending: { count: 0, totalAmount: 0 },
    approved: { count: 0, totalAmount: 0 },
    rejected: { count: 0, totalAmount: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [adminNote, setAdminNote] = useState('');
  const [approving, setApproving] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    page: 1,
    limit: 10
  });

  useEffect(() => {
    fetchClaimRequests();
    fetchStats();
  }, [filters]);

  const fetchClaimRequests = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getClaimRequests(filters);
      setClaimRequests(response.data.claimRequests);
    } catch (error) {
      console.error('Failed to fetch claim requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await adminAPI.getClaimRequestStats();
      setStats(response.data.stats);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleApprove = async () => {
    if (!selectedRequest || approving) return;

    setApproving(true);
    try {
      await adminAPI.approveClaimRequest(selectedRequest._id, adminNote);
      
      // Refresh data
      await fetchClaimRequests();
      await fetchStats();
      
      // Close modal
      setShowApprovalModal(false);
      setSelectedRequest(null);
      setAdminNote('');
      
      alert('Claim request approved successfully! Email notification sent to user.');
    } catch (error) {
      console.error('Failed to approve claim request:', error);
      alert('Failed to approve claim request. Please try again.');
    } finally {
      setApproving(false);
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
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Claiming Requests
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage user earning claim requests and process payments
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-400">Pending Requests</p>
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
        
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-800 dark:text-green-400">Approved</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-300">
                {stats.approved.count}
              </p>
              <p className="text-sm text-green-700 dark:text-green-400">
                {stats.approved.totalAmount.toLocaleString()} LKR
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-800 dark:text-blue-400">Total Processed</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-300">
                {(stats.approved.totalAmount + stats.rejected.totalAmount).toLocaleString()} LKR
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-400">
                {stats.approved.count + stats.rejected.count} requests
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by user email..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Claim Requests List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Claim Requests
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : claimRequests.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No claim requests found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                No claim requests match your current filters.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {claimRequests.map((request) => (
                <div key={request._id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(request.status)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>
                        </div>
                        <div className="text-xl font-bold text-gray-900 dark:text-white">
                          {request.totalAmount.toLocaleString()} LKR
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          ({request.earningIds.length} earnings)
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">User:</span>
                            <span className="ml-1 font-medium text-gray-900 dark:text-white">
                              {request.userId?.name}
                            </span>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {request.userId?.email}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Requested:</span>
                            <span className="ml-1 font-medium text-gray-900 dark:text-white">
                              {formatDate(request.createdAt)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <CreditCard className="w-4 h-4 text-gray-400" />
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Payment:</span>
                            <span className="ml-1 font-medium text-gray-900 dark:text-white">
                              {request.bankDetails.binanceId ? 'Binance ID' : 'Bank Transfer'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => setSelectedRequest(request)}
                        className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </button>
                      
                      {request.status === 'pending' && (
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowApprovalModal(true);
                          }}
                          className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          <Check className="w-4 h-4" />
                          <span>Approve</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* View Request Modal */}
      {selectedRequest && !showApprovalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Claim Request Details
                </h3>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Request Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {selectedRequest.totalAmount.toLocaleString()} LKR
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Earnings Count</p>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white">
                      {selectedRequest.earningIds.length}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedRequest.status)}`}>
                      {getStatusIcon(selectedRequest.status)}
                      <span className="ml-1">{selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* User Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">User Information</h4>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Name</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedRequest.userId?.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedRequest.userId?.email}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bank Details */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Payment Details</h4>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  {selectedRequest.bankDetails.binanceId ? (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Binance ID</p>
                      <p className="font-medium text-gray-900 dark:text-white font-mono">
                        {selectedRequest.bankDetails.binanceId}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Bank</p>
                        <p className="font-medium text-gray-900 dark:text-white">{selectedRequest.bankDetails.bank}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Branch</p>
                        <p className="font-medium text-gray-900 dark:text-white">{selectedRequest.bankDetails.branch}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Account Number</p>
                        <p className="font-medium text-gray-900 dark:text-white font-mono">
                          ****{selectedRequest.bankDetails.accountNo?.slice(-4)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Account Name</p>
                        <p className="font-medium text-gray-900 dark:text-white">{selectedRequest.bankDetails.accountName}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Earnings Details */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Earnings Breakdown</h4>
                <div className="space-y-3">
                  {selectedRequest.earningIds.map((earning) => (
                    <div key={earning._id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {earning.amount.toLocaleString()} LKR
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              from {earning.buyerId?.name || earning.buyerEmail}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            <span>Item: {earning.item}</span>
                            <span className="mx-2">•</span>
                            <span>Promo Code: {earning.usedPromoCode}</span>
                            <span className="mx-2">•</span>
                            <span>Date: {formatDate(earning.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Admin Actions */}
              {selectedRequest.status === 'pending' && (
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setShowApprovalModal(true)}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Approve Request
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Approve Claim Request
              </h3>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="font-medium text-green-800 dark:text-green-300">Confirm Approval</span>
                </div>
                <p className="text-sm text-green-700 dark:text-green-400">
                  You are about to approve a claim request for {selectedRequest.totalAmount.toLocaleString()} LKR.
                  This will update all earnings to "paid" status and send an email notification to the user.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Admin Note (Optional)
                </label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Add any notes for the user..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowApprovalModal(false);
                  setAdminNote('');
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={approving}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
              >
                {approving ? 'Processing...' : 'Approve & Send Email'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClaimingRequests;
