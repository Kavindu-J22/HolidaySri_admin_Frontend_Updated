import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Eye, Check, X, Loader, ChevronDown, ChevronUp, DollarSign, Calendar, User, Mail, Phone, MapPin } from 'lucide-react';

const DonationWithdrawalRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [expandedRequest, setExpandedRequest] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected
  const [adminNote, setAdminNote] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionType, setActionType] = useState(''); // approve, reject, or markPaid
  const [paymentNote, setPaymentNote] = useState('');

  useEffect(() => {
    fetchWithdrawalRequests();
  }, []);

  const fetchWithdrawalRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('http://localhost:5000/api/donations-raise-fund/admin/withdrawal-requests', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setRequests(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching withdrawal requests:', error);
      alert('Failed to fetch withdrawal requests');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessRequest = async () => {
    if (!selectedRequest || !actionType) return;

    setProcessing(selectedRequest._id);

    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.put(
        `http://localhost:5000/api/donations-raise-fund/admin/withdrawal-requests/${selectedRequest._id}`,
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
        alert(`✅ Withdrawal request ${actionType}!`);
        setShowModal(false);
        setAdminNote('');
        setSelectedRequest(null);
        setActionType('');
        fetchWithdrawalRequests(); // Refresh list
      }
    } catch (error) {
      console.error('Error processing request:', error);
      alert(error.response?.data?.message || 'Failed to process request');
    } finally {
      setProcessing(null);
    }
  };

  const handleMarkAsPaid = async () => {
    if (!selectedRequest) return;

    if (!window.confirm('Are you sure you want to mark this withdrawal as paid? This will:\n\n1. Send payment confirmation email to the user\n2. Create a paid fund record\n3. DELETE the campaign and advertisement permanently\n\nThis action cannot be undone!')) {
      return;
    }

    setProcessing(selectedRequest._id);

    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.post(
        `http://localhost:5000/api/donations-raise-fund/admin/mark-as-paid/${selectedRequest._id}`,
        {
          paymentNote: paymentNote.trim()
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        alert(`✅ Withdrawal marked as paid successfully!\n\n${response.data.data.emailSent ? '📧 Payment confirmation email sent to user' : '⚠️ Email sending failed, but payment recorded'}\n\nCampaign and advertisement have been deleted.`);
        setShowModal(false);
        setPaymentNote('');
        setSelectedRequest(null);
        setActionType('');
        fetchWithdrawalRequests(); // Refresh list
      }
    } catch (error) {
      console.error('Error marking as paid:', error);
      alert(error.response?.data?.message || 'Failed to mark as paid');
    } finally {
      setProcessing(null);
    }
  };

  const openModal = (request, action) => {
    setSelectedRequest(request);
    setActionType(action);
    setAdminNote('');
    setShowModal(true);
  };

  const filteredRequests = requests.filter(req => {
    if (filter === 'all') return true;
    return req.withdrawalRequest.status === filter;
  });

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
      approved: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
      rejected: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
    };
    return badges[status] || '';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Donation Withdrawal Requests</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage fundraising campaign withdrawal requests</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {['all', 'pending', 'approved', 'rejected'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 font-medium capitalize transition-colors ${
              filter === tab
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {tab} ({requests.filter(r => tab === 'all' || r.withdrawalRequest.status === tab).length})
          </button>
        ))}
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">No withdrawal requests found</p>
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
                        <Calendar className="w-4 h-4" />
                        Requested: {new Date(request.withdrawalRequest.requestedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(request.withdrawalRequest.status)}`}>
                    {request.withdrawalRequest.status.toUpperCase()}
                  </span>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Raised (HSC)</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{request.totalDonatedHSC.toFixed(2)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">{request.totalDonatedLKR.toLocaleString()} LKR</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Goal (HSC)</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{request.requestedAmountHSC.toFixed(2)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">{request.requestedAmountLKR.toLocaleString()} LKR</p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Donations</p>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{request.donationCount}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">{request.fundTransfers?.length || 0} transfers</p>
                  </div>
                </div>

                {/* Expand/Collapse Button */}
                <button
                  onClick={() => setExpandedRequest(expandedRequest === request._id ? null : request._id)}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
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
                    {/* Campaign Details */}
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Campaign Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">Category</p>
                          <p className="font-medium text-gray-900 dark:text-white">{request.category}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">Location</p>
                          <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {request.city}, {request.province}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">Email</p>
                          <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {request.email}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">Contact</p>
                          <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {request.contact}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Description</h4>
                      <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">{request.description}</p>
                    </div>

                    {/* Fund Transfers */}
                    {request.fundTransfers && request.fundTransfers.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Recent Transfers</h4>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {request.fundTransfers.slice(-5).reverse().map((transfer, index) => (
                            <div key={index} className="bg-gray-50 dark:bg-gray-700 p-3 rounded text-sm">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white">{transfer.userName}</p>
                                  <p className="text-xs text-gray-600 dark:text-gray-400">
                                    {new Date(transfer.createdAt).toLocaleString()}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-green-600 dark:text-green-400">{transfer.amountHSC.toFixed(2)} HSC</p>
                                  <p className="text-xs text-gray-600 dark:text-gray-400">{transfer.amountLKR.toLocaleString()} LKR</p>
                                </div>
                              </div>
                              {transfer.comment && (
                                <p className="text-gray-700 dark:text-gray-300 mt-2 italic">"{transfer.comment}"</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Admin Note (if processed) */}
                    {request.withdrawalRequest.status !== 'pending' && request.withdrawalRequest.adminNote && (
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Admin Note</h4>
                        <p className="text-gray-700 dark:text-gray-300 text-sm">{request.withdrawalRequest.adminNote}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                          Processed on {new Date(request.withdrawalRequest.processedAt).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                {request.withdrawalRequest.status === 'pending' && (
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => openModal(request, 'approved')}
                      disabled={processing === request._id}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => openModal(request, 'rejected')}
                      disabled={processing === request._id}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                )}

                {/* Mark as Paid Button - Only for Approved Requests */}
                {request.withdrawalRequest.status === 'approved' && (
                  <div className="mt-4">
                    <button
                      onClick={() => openModal(request, 'markPaid')}
                      disabled={processing === request._id}
                      className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 font-semibold"
                    >
                      <DollarSign className="w-5 h-5" />
                      {processing === request._id ? 'Processing...' : 'Mark as Paid & Delete'}
                    </button>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                      ⚠️ This will send payment email, record payment, and permanently delete the campaign & ad
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Confirmation Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {actionType === 'markPaid' ? 'Mark as Paid' : actionType === 'approved' ? 'Approve' : 'Reject'} Withdrawal Request
            </h3>

            {actionType === 'markPaid' ? (
              <>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
                  <p className="text-yellow-800 dark:text-yellow-200 font-semibold mb-2">⚠️ Warning: This action cannot be undone!</p>
                  <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                    Marking as paid will:
                  </p>
                  <ul className="list-disc list-inside text-yellow-700 dark:text-yellow-300 text-sm mt-2 space-y-1">
                    <li>Send payment confirmation email to the user</li>
                    <li>Create a permanent paid fund record</li>
                    <li>Permanently DELETE the campaign</li>
                    <li>Permanently DELETE the advertisement slot</li>
                  </ul>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Payment Summary</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300"><strong>Campaign:</strong> {selectedRequest.title}</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300"><strong>Amount:</strong> {selectedRequest.totalDonatedHSC.toFixed(2)} HSC ({selectedRequest.totalDonatedLKR.toLocaleString()} LKR)</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300"><strong>Organizer:</strong> {selectedRequest.organizer}</p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Payment Note (Optional)
                  </label>
                  <textarea
                    value={paymentNote}
                    onChange={(e) => setPaymentNote(e.target.value)}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Add internal payment notes (e.g., transaction reference, payment method)..."
                  ></textarea>
                </div>
              </>
            ) : (
              <>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Are you sure you want to {actionType === 'approved' ? 'approve' : 'reject'} the withdrawal request for <strong>{selectedRequest.title}</strong>?
                </p>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Admin Note {actionType === 'rejected' && '(Required for rejection)'}
                  </label>
                  <textarea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Add a note for the campaign owner..."
                  ></textarea>
                </div>
              </>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setAdminNote('');
                  setPaymentNote('');
                  setSelectedRequest(null);
                  setActionType('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                disabled={processing}
              >
                Cancel
              </button>
              <button
                onClick={actionType === 'markPaid' ? handleMarkAsPaid : handleProcessRequest}
                disabled={processing || (actionType === 'rejected' && !adminNote.trim())}
                className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 ${
                  actionType === 'markPaid' ? 'bg-blue-600 hover:bg-blue-700' :
                  actionType === 'approved' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {processing ? 'Processing...' :
                  actionType === 'markPaid' ? 'Confirm Payment & Delete' :
                  `Confirm ${actionType === 'approved' ? 'Approval' : 'Rejection'}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonationWithdrawalRequests;

