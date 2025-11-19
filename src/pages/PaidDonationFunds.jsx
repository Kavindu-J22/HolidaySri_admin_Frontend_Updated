import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, Calendar, User, Mail, Phone, ChevronDown, ChevronUp, Loader, Building2 } from 'lucide-react';

const PaidDonationFunds = () => {
  const [paidFunds, setPaidFunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedFund, setExpandedFund] = useState(null);

  useEffect(() => {
    fetchPaidFunds();
  }, []);

  const fetchPaidFunds = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('https://holidaysri-backend-9xm4.onrender.com/api/donations-raise-fund/admin/paid-funds', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setPaidFunds(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching paid funds:', error);
      alert('Failed to fetch paid funds');
    } finally {
      setLoading(false);
    }
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Paid Donation Funds</h1>
        <p className="text-gray-600 dark:text-gray-400">
          View all paid withdrawal records for donation campaigns
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Paid</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{paidFunds.length}</p>
            </div>
            <DollarSign className="w-10 h-10 text-green-600" />
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount (HSC)</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {paidFunds.reduce((sum, fund) => sum + fund.raisedAmountHSC, 0).toFixed(2)}
              </p>
            </div>
            <DollarSign className="w-10 h-10 text-blue-600" />
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount (LKR)</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {paidFunds.reduce((sum, fund) => sum + fund.raisedAmountLKR, 0).toLocaleString()}
              </p>
            </div>
            <DollarSign className="w-10 h-10 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Paid Funds List */}
      <div className="space-y-4">
        {paidFunds.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">No paid funds found</p>
          </div>
        ) : (
          paidFunds.map((fund) => (
            <div key={fund._id} className="card">
              <div className="p-6">
                {/* Fund Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {fund.campaignTitle}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {fund.organizer}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Paid: {new Date(fund.paidAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                    PAID
                  </span>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Amount Paid (HSC)</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{fund.raisedAmountHSC.toFixed(2)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">{fund.raisedAmountLKR.toLocaleString()} LKR</p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Goal (HSC)</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{fund.requestedAmountHSC.toFixed(2)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">{fund.requestedAmountLKR.toLocaleString()} LKR</p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Category</p>
                    <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{fund.category}</p>
                  </div>
                </div>

                {/* Expand/Collapse Button */}
                <button
                  onClick={() => setExpandedFund(expandedFund === fund._id ? null : fund._id)}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
                >
                  {expandedFund === fund._id ? (
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
                {expandedFund === fund._id && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-4">
                    {/* User Details */}
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Recipient Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">Name</p>
                          <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {fund.userName}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">Email</p>
                          <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {fund.userEmail}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">Contact</p>
                          <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {fund.userContact}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Bank Details */}
                    {fund.bankDetails && fund.bankDetails.bankName && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          Bank Details
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-gray-600 dark:text-gray-400">Bank Name</p>
                            <p className="font-medium text-gray-900 dark:text-white">{fund.bankDetails.bankName}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 dark:text-gray-400">Account Number</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {fund.bankDetails.accountNumber ? `****${fund.bankDetails.accountNumber.slice(-4)}` : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600 dark:text-gray-400">Account Holder</p>
                            <p className="font-medium text-gray-900 dark:text-white">{fund.bankDetails.accountHolderName || fund.userName}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 dark:text-gray-400">Branch</p>
                            <p className="font-medium text-gray-900 dark:text-white">{fund.bankDetails.branchName || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Timeline */}
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Timeline</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Withdrawal Requested:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {new Date(fund.withdrawalRequestedAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Approved:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {new Date(fund.withdrawalApprovedAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Paid:</span>
                          <span className="font-medium text-green-600 dark:text-green-400">
                            {new Date(fund.paidAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Admin Notes */}
                    {(fund.adminNote || fund.paymentNote) && (
                      <div className="space-y-3">
                        {fund.adminNote && (
                          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Approval Note</h4>
                            <p className="text-gray-700 dark:text-gray-300 text-sm">{fund.adminNote}</p>
                          </div>
                        )}
                        {fund.paymentNote && (
                          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Payment Note</h4>
                            <p className="text-gray-700 dark:text-gray-300 text-sm">{fund.paymentNote}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">Paid by: {fund.paidBy}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Advertisement Info */}
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Advertisement Info (Deleted)</h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">Ad ID</p>
                          <p className="font-medium text-gray-900 dark:text-white">{fund.advertisementId}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">Slot</p>
                          <p className="font-medium text-gray-900 dark:text-white">{fund.advertisementSlot}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PaidDonationFunds;

