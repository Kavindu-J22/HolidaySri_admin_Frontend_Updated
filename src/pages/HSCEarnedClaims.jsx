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

const HSCEarnedClaims = () => {
  const [claimRequests, setClaimRequests] = useState([]);
  const [stats, setStats] = useState({
    pending: { count: 0, totalHSCAmount: 0, totalLKRAmount: 0 },
    approved: { count: 0, totalHSCAmount: 0, totalLKRAmount: 0 },
    rejected: { count: 0, totalHSCAmount: 0, totalLKRAmount: 0 }
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
      const response = await adminAPI.getHSCEarnedClaims(filters);
      setClaimRequests(response.data.claimRequests);
    } catch (error) {
      console.error('Failed to fetch HSC earned claim requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await adminAPI.getHSCEarnedClaimStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch HSC earned claim stats:', error);
    }
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;

    setApproving(true);
    try {
      const response = await adminAPI.approveHSCEarnedClaim(selectedRequest._id, adminNote);
      
      if (response.data.success) {
        alert('HSC earned claim request approved successfully!');
        setShowApprovalModal(false);
        setSelectedRequest(null);
        setAdminNote('');
        await fetchClaimRequests();
        await fetchStats();
      }
    } catch (error) {
      console.error('Failed to approve HSC earned claim:', error);
      const errorMessage = error.response?.data?.message || 'Failed to approve claim request';
      alert(errorMessage);
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'approved': return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      case 'rejected': return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          HSC Earned Claims
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage HSC earned claim requests from users
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Pending Claims
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.pending.count}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {stats.pending.totalLKRAmount.toLocaleString()} LKR
              </p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/20">
              <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Approved Claims
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.approved.count}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {stats.approved.totalLKRAmount.toLocaleString()} LKR
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total HSC Value
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {(stats.pending.totalHSCAmount + stats.approved.totalHSCAmount).toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                HSC Tokens
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
              <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by email or account name..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="relative">
              <Filter className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
                className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Claims List */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            HSC Earned Claim Requests
          </h3>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading claim requests...</p>
          </div>
        ) : claimRequests.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No claim requests found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {filters.status === 'all' 
                ? 'No HSC earned claim requests have been submitted yet.'
                : `No ${filters.status} claim requests found.`
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {claimRequests.map((request) => (
              <div key={request._id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {request.userId?.name || 'Unknown User'}
                        </span>
                      </div>
                      <span className="text-gray-500 dark:text-gray-400">•</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {request.userEmail}
                      </span>
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                        <span className="ml-1 capitalize">{request.status}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">HSC Amount</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {request.totalHSCAmount.toLocaleString()} HSC
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">LKR Amount</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {request.totalLKRAmount.toLocaleString()} LKR
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Records Count</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {request.hscEarnedIds?.length || 0} records
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Submitted</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {formatDate(request.createdAt)}
                        </p>
                      </div>
                    </div>

                    {request.processedAt && (
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Processed by {request.processedBy} on {formatDate(request.processedAt)}
                      </div>
                    )}

                    {request.adminNote && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-4">
                        <p className="text-sm text-blue-800 dark:text-blue-300">
                          <strong>Admin Note:</strong> {request.adminNote}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => setSelectedRequest(request)}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    
                    {request.status === 'pending' && (
                      <button
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowApprovalModal(true);
                        }}
                        className="p-2 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                        title="Approve"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Request Details Modal */}
      {selectedRequest && !showApprovalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full mx-4 shadow-2xl transform transition-all max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-t-2xl p-6 text-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">HSC Earned Claim Details</h3>
              <p className="text-white text-opacity-90 text-sm">Request ID: {selectedRequest._id}</p>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* User Information */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">User Information</h4>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Name</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedRequest.userId?.name || 'Unknown'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedRequest.userEmail}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Claim Information */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Claim Information</h4>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">HSC Amount</p>
                      <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        {selectedRequest.totalHSCAmount.toLocaleString()} HSC
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">LKR Amount</p>
                      <p className="text-xl font-bold text-green-600 dark:text-green-400">
                        {selectedRequest.totalLKRAmount.toLocaleString()} LKR
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">HSC to LKR Rate</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        1 HSC = {selectedRequest.hscToLKRRate} LKR
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Records Count</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedRequest.hscEarnedIds?.length || 0} records
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bank Details */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Payment Details</h4>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  {selectedRequest.bankDetails?.binanceId ? (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Binance ID</p>
                      <p className="font-medium text-gray-900 dark:text-white font-mono">
                        {selectedRequest.bankDetails.binanceId}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Bank</p>
                        <p className="font-medium text-gray-900 dark:text-white">{selectedRequest.bankDetails?.bank || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Branch</p>
                        <p className="font-medium text-gray-900 dark:text-white">{selectedRequest.bankDetails?.branch || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Account Number</p>
                        <p className="font-medium text-gray-900 dark:text-white font-mono">{selectedRequest.bankDetails?.accountNo || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Account Name</p>
                        <p className="font-medium text-gray-900 dark:text-white">{selectedRequest.bankDetails?.accountName || 'N/A'}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Status and Dates */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Status Information</h4>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedRequest.status)}`}>
                        {getStatusIcon(selectedRequest.status)}
                        <span className="ml-1 capitalize">{selectedRequest.status}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Submitted</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatDate(selectedRequest.createdAt)}
                      </p>
                    </div>
                    {selectedRequest.processedAt && (
                      <>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Processed</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {formatDate(selectedRequest.processedAt)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Processed By</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {selectedRequest.processedBy}
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  {selectedRequest.adminNote && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Admin Note</p>
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                        <p className="text-sm text-blue-800 dark:text-blue-300">
                          {selectedRequest.adminNote}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="flex-1 px-4 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors duration-200"
                >
                  Close
                </button>
                {selectedRequest.status === 'pending' && (
                  <button
                    onClick={() => setShowApprovalModal(true)}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    Approve Claim
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full mx-4 shadow-2xl transform transition-all">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-t-2xl p-6 text-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Approve HSC Earned Claim</h3>
              <p className="text-white text-opacity-90 text-sm">Confirm the bank transfer completion</p>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-4">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                    {selectedRequest.totalLKRAmount.toLocaleString()} LKR
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    ({selectedRequest.totalHSCAmount.toLocaleString()} HSC)
                  </p>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-center mb-2">
                    <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mr-2" />
                    <span className="text-sm font-medium text-amber-800 dark:text-amber-300">Important:</span>
                  </div>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Only approve this claim after confirming the bank transfer has been completed successfully.
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Admin Note (Optional)
                  </label>
                  <textarea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="Add any notes about this approval..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={() => {
                    setShowApprovalModal(false);
                    setAdminNote('');
                  }}
                  disabled={approving}
                  className="flex-1 px-4 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApprove}
                  disabled={approving}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-50"
                >
                  {approving ? 'Approving...' : 'Confirm Approval'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HSCEarnedClaims;
