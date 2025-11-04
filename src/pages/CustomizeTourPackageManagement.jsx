import React, { useState, useEffect } from 'react';
import { Package, Search, Filter, CheckCircle, XCircle, Clock, Eye, MessageSquare, Settings, DollarSign } from 'lucide-react';
import { adminAPI } from '../config/api';

const CustomizeTourPackageManagement = () => {
  const [activeTab, setActiveTab] = useState('requests');
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    underReview: 0,
    approved: 0,
    rejected: 0,
    totalHSCCollected: 0
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [adminNote, setAdminNote] = useState('');
  const [actionType, setActionType] = useState('');
  const [processing, setProcessing] = useState(false);

  // Settings state
  const [hscConfig, setHscConfig] = useState({
    customizeTourPackageCharge: 100
  });
  const [newCharge, setNewCharge] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState('');

  useEffect(() => {
    fetchStats();
    fetchRequests();
    fetchHSCConfig();
  }, [statusFilter, searchTerm]);

  const fetchHSCConfig = async () => {
    try {
      const response = await adminAPI.getHSCConfig();
      setHscConfig({
        customizeTourPackageCharge: response.data.customizeTourPackageCharge || 100
      });
      setNewCharge(response.data.customizeTourPackageCharge?.toString() || '100');
    } catch (error) {
      console.error('Error fetching HSC config:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await adminAPI.getCustomizeTourPackageStats();
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getCustomizeTourPackageRequests({
        status: statusFilter,
        search: searchTerm
      });
      setRequests(response.data.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (requestId, newStatus) => {
    try {
      setProcessing(true);
      await adminAPI.updateCustomizeTourPackageStatus(requestId, {
        status: newStatus,
        adminNote: adminNote
      });
      
      setShowModal(false);
      setAdminNote('');
      setSelectedRequest(null);
      
      // Refresh data
      await fetchStats();
      await fetchRequests();
    } catch (error) {
      console.error('Error updating status:', error);
      alert(error.response?.data?.message || 'Failed to update status');
    } finally {
      setProcessing(false);
    }
  };

  const openActionModal = (request, action) => {
    setSelectedRequest(request);
    setActionType(action);
    setAdminNote('');
    setShowModal(true);
  };

  const handleUpdateCharge = async () => {
    const value = parseFloat(newCharge);
    if (!value || value <= 0) {
      setUpdateError('Please enter a valid charge value');
      return;
    }

    try {
      setUpdating(true);
      setUpdateError('');
      setUpdateSuccess(false);

      const response = await adminAPI.updateHSCConfig({
        customizeTourPackageCharge: value
      });

      console.log('Update response:', response.data);

      // Refresh the config from server to ensure we have the latest
      await fetchHSCConfig();

      setUpdateSuccess(true);

      // Refresh stats to show updated charge
      await fetchStats();

      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (error) {
      console.error('Update error:', error);
      setUpdateError(error.response?.data?.message || 'Failed to update charge');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      'under-review': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      'approved': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      'rejected': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    };
    return badges[status] || badges.pending;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      case 'under-review':
        return <Eye className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Package className="w-8 h-8 text-orange-600 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Customize Tour Package Management
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage customer tour package customization requests
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('requests')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'requests'
                ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Customer Requests
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === 'settings'
                ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'settings' ? (
        // Settings Tab
        <div className="space-y-6">
          <div className="card p-6">
            <div className="flex items-center mb-6">
              <DollarSign className="w-6 h-6 text-orange-600 mr-3" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Request Charge Configuration
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Set the HSC charge for customize tour package requests
                </p>
              </div>
            </div>

            {updateSuccess && (
              <div className="mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                  <span className="text-sm text-green-600 dark:text-green-400">
                    Charge updated successfully!
                  </span>
                </div>
              </div>
            )}

            {updateError && (
              <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center">
                  <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
                  <span className="text-sm text-red-600 dark:text-red-400">{updateError}</span>
                </div>
              </div>
            )}

            <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-300">
                    Customize Tour Package Request Charge
                  </h3>
                  <p className="text-sm text-orange-700 dark:text-orange-400 mt-1">
                    Current charge: <span className="font-bold">{hscConfig.customizeTourPackageCharge} HSC</span>
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-orange-900 dark:text-orange-300 mb-2">
                    New Charge (HSC)
                  </label>
                  <input
                    type="number"
                    value={newCharge}
                    onChange={(e) => setNewCharge(e.target.value)}
                    min="1"
                    step="1"
                    className="input-field"
                    placeholder="Enter charge amount"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleUpdateCharge}
                    disabled={updating}
                    className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {updating ? 'Updating...' : 'Update Charge'}
                  </button>
                </div>
              </div>

              <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Note:</strong> This charge will be deducted from users' HSC balance when they submit a customize tour package request. Make sure to set a reasonable amount.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Requests Tab
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="card p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Requests</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="card p-4 bg-yellow-50 dark:bg-yellow-900/20">
          <p className="text-sm text-yellow-800 dark:text-yellow-400">Pending</p>
          <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-300">{stats.pending}</p>
        </div>
        <div className="card p-4 bg-blue-50 dark:bg-blue-900/20">
          <p className="text-sm text-blue-800 dark:text-blue-400">Under Review</p>
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-300">{stats.underReview}</p>
        </div>
        <div className="card p-4 bg-green-50 dark:bg-green-900/20">
          <p className="text-sm text-green-800 dark:text-green-400">Approved</p>
          <p className="text-2xl font-bold text-green-900 dark:text-green-300">{stats.approved}</p>
        </div>
        <div className="card p-4 bg-red-50 dark:bg-red-900/20">
          <p className="text-sm text-red-800 dark:text-red-400">Rejected</p>
          <p className="text-2xl font-bold text-red-900 dark:text-red-300">{stats.rejected}</p>
        </div>
        <div className="card p-4 bg-orange-50 dark:bg-orange-900/20">
          <p className="text-sm text-orange-800 dark:text-orange-400">HSC Collected</p>
          <p className="text-2xl font-bold text-orange-900 dark:text-orange-300">{stats.totalHSCCollected}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, email, or contact..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="under-review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Travel Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Accommodation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  HSC Charge
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Submitted
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
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                    </div>
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    No requests found
                  </td>
                </tr>
              ) : (
                requests.map((request) => (
                  <tr key={request._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {request.fullName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {request.email}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {request.contactNumber}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        <div>Start: {new Date(request.startDate).toLocaleDateString()}</div>
                        <div>Travelers: {request.numberOfTravelers}</div>
                        <div>Duration: {request.duration} days</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white capitalize">
                        {request.accommodation === 'other' 
                          ? request.accommodationOther 
                          : request.accommodation.replace('-', ' ')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                        {request.hscCharge} HSC
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(request.status)}`}>
                        {getStatusIcon(request.status)}
                        {request.status.replace('-', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {request.status === 'pending' && (
                          <>
                            <button
                              onClick={() => openActionModal(request, 'under-review')}
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                            >
                              Review
                            </button>
                            <button
                              onClick={() => openActionModal(request, 'approved')}
                              className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 text-sm font-medium"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => openActionModal(request, 'rejected')}
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {request.status === 'under-review' && (
                          <>
                            <button
                              onClick={() => openActionModal(request, 'approved')}
                              className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 text-sm font-medium"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => openActionModal(request, 'rejected')}
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {actionType === 'approved' ? 'Approve' : actionType === 'rejected' ? 'Reject' : 'Review'} Request
              </h3>
              
              {/* Request Details */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4 space-y-2">
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Customer:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">{selectedRequest.fullName}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Email:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">{selectedRequest.email}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Contact:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">{selectedRequest.contactNumber}</span>
                </div>
                {selectedRequest.specialRequests && (
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Special Requests:</span>
                    <p className="mt-1 text-gray-900 dark:text-white">{selectedRequest.specialRequests}</p>
                  </div>
                )}
                {selectedRequest.activities && selectedRequest.activities.length > 0 && (
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Activities:</span>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {selectedRequest.activities.map((activity, index) => (
                        <span key={index} className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400 rounded text-sm">
                          {activity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Admin Note */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <MessageSquare className="w-4 h-4 inline mr-1" />
                  Admin Note
                </label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  rows="4"
                  className="input-field"
                  placeholder="Add a note for this action..."
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setAdminNote('');
                    setSelectedRequest(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  disabled={processing}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleStatusChange(selectedRequest._id, actionType)}
                  className={`flex-1 px-4 py-2 rounded-lg text-white ${
                    actionType === 'approved' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : actionType === 'rejected'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  } disabled:opacity-50`}
                  disabled={processing}
                >
                  {processing ? 'Processing...' : `Confirm ${actionType === 'approved' ? 'Approval' : actionType === 'rejected' ? 'Rejection' : 'Review'}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
};

export default CustomizeTourPackageManagement;

