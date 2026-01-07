import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Heart, User, MapPin, Calendar, DollarSign, Eye, Check, X, Filter, Loader, ChevronDown, ChevronUp } from 'lucide-react';

const DonationPublicationRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [expandedRequest, setExpandedRequest] = useState(null);
  const [filter, setFilter] = useState('all'); // all, Pending, Approved, Rejected
  const [adminNote, setAdminNote] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionType, setActionType] = useState(''); // Approved or Rejected

  useEffect(() => {
    fetchPublicationRequests();
  }, []);

  const fetchPublicationRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('https://holidaysri-backend-9xm4.onrender.com/api/donations-raise-fund/admin/publication-requests', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setRequests(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching publication requests:', error);
      alert('Failed to fetch publication requests');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (request, action) => {
    setSelectedRequest(request);
    setActionType(action);
    setAdminNote('');
    setShowModal(true);
  };

  const handleProcessRequest = async () => {
    if (!selectedRequest || !actionType) return;

    setProcessing(selectedRequest._id);

    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.put(
        `https://holidaysri-backend-9xm4.onrender.com/api/donations-raise-fund/admin/publication-requests/${selectedRequest._id}`,
        {
          status: actionType,
          adminNote: adminNote.trim()
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        alert(`✅ Campaign ${actionType.toLowerCase()} successfully!`);
        setShowModal(false);
        setAdminNote('');
        setSelectedRequest(null);
        setActionType('');
        fetchPublicationRequests(); // Refresh list
      }
    } catch (error) {
      console.error('Error processing request:', error);
      alert(error.response?.data?.message || 'Failed to process request');
    } finally {
      setProcessing(null);
    }
  };

  const filteredRequests = requests.filter(request => {
    if (filter === 'all') return true;
    return request.adminApprove === filter;
  });

  const getStatusBadge = (status) => {
    const badges = {
      'Pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'Approved': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Rejected': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return badges[status] || badges['Pending'];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Donation Publication Requests
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Review and manage donation campaign publication requests
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {['all', 'Pending', 'Approved', 'Rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {status === 'all' ? 'All Requests' : status}
            {status !== 'all' && (
              <span className="ml-2 px-2 py-0.5 bg-white dark:bg-gray-800 rounded-full text-xs">
                {requests.filter(r => r.adminApprove === status).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Requests</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{requests.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{requests.filter(r => r.adminApprove === 'Pending').length}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Approved</p>
          <p className="text-2xl font-bold text-green-600">{requests.filter(r => r.adminApprove === 'Approved').length}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Rejected</p>
          <p className="text-2xl font-bold text-red-600">{requests.filter(r => r.adminApprove === 'Rejected').length}</p>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">No publication requests found</p>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <div key={request._id} className="card">
              <div className="p-6">
                {/* Request Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {request.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {request.organizer}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {request.category}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {request.city}, {request.province}
                      </span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(request.adminApprove)}`}>
                    {request.adminApprove}
                  </span>
                </div>

                {/* Campaign Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 dark:text-gray-400">Requested Amount</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      LKR {request.requestedAmountLKR?.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 dark:text-gray-400">Views</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{request.viewCount}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 dark:text-gray-400">Donations</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{request.donationCount}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 dark:text-gray-400">Raised</p>
                    <p className="text-lg font-bold text-green-600">
                      LKR {request.totalDonatedLKR?.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Expand/Collapse Button */}
                <button
                  onClick={() => setExpandedRequest(expandedRequest === request._id ? null : request._id)}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mb-4"
                >
                  {expandedRequest === request._id ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      Hide Details
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      View Details
                    </>
                  )}
                </button>

                {/* Expanded Details */}
                {expandedRequest === request._id && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Description</h4>
                      <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{request.description}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Contact Information</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Email: {request.email}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Phone: {request.contact}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Address: {request.address}</p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Campaign Owner</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Name: {request.userId?.name || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Email: {request.userId?.email || 'N/A'}
                        </p>
                      </div>
                    </div>

                    {request.images && request.images.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Campaign Images</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {request.images.map((image, index) => (
                            <img
                              key={index}
                              src={image.url}
                              alt={`Campaign ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {request.adminNote && (
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                        <h4 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-2">Admin Note</h4>
                        <p className="text-sm text-yellow-800 dark:text-yellow-300">{request.adminNote}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                {request.adminApprove === 'Pending' && (
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => openModal(request, 'Approved')}
                      disabled={processing === request._id}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => openModal(request, 'Rejected')}
                      disabled={processing === request._id}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {actionType === 'Approved' ? 'Approve Campaign' : 'Reject Campaign'}
            </h3>

            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Are you sure you want to {actionType.toLowerCase()} this donation campaign?
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Admin Note {actionType === 'Rejected' && '(Required for rejection)'}
              </label>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder={actionType === 'Approved' ? 'Add a note (optional)...' : 'Provide reason for rejection...'}
              ></textarea>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setAdminNote('');
                  setSelectedRequest(null);
                  setActionType('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                disabled={processing}
              >
                Cancel
              </button>
              <button
                onClick={handleProcessRequest}
                disabled={processing || (actionType === 'Rejected' && !adminNote.trim())}
                className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 ${
                  actionType === 'Approved' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {processing ? 'Processing...' : `Confirm ${actionType === 'Approved' ? 'Approval' : 'Rejection'}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonationPublicationRequests;

