import React, { useState, useEffect } from 'react';
import {
  Send,
  Search,
  CheckCircle,
  AlertCircle,
  Gift,
  History,
  Eye,
  Loader,
  UserCheck,
  UserX
} from 'lucide-react';
import { adminAPI } from '../config/api';

const TokenDistribution = () => {
  const [activeTab, setActiveTab] = useState('distribute');
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [distributing, setDistributing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  // Distribution form state
  const [tokenType, setTokenType] = useState('HSC');
  const [amount, setAmount] = useState('');
  const [adminMessage, setAdminMessage] = useState('');

  // Distribution history state
  const [distributionHistory, setDistributionHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [historyFilters, setHistoryFilters] = useState({
    tokenType: 'all',
    status: 'all'
  });

  // Distribution details modal state
  const [selectedDistribution, setSelectedDistribution] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Success/Error states
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  // Fetch users for distribution
  const fetchUsers = async (page = 1, search = '') => {
    try {
      setLoading(true);
      const response = await adminAPI.getUsersForDistribution({
        page,
        limit: 20,
        search
      });

      setUsers(response.data.users);
      setCurrentPage(response.data.pagination.current);
      setTotalPages(response.data.pagination.pages);
      setTotalUsers(response.data.pagination.total);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  // Fetch distribution history
  const fetchDistributionHistory = async (page = 1) => {
    try {
      setHistoryLoading(true);
      const response = await adminAPI.getDistributionHistory({
        page,
        limit: 10,
        ...historyFilters
      });

      setDistributionHistory(response.data.distributions);
      setHistoryPage(response.data.pagination.current);
      setHistoryTotalPages(response.data.pagination.pages);
    } catch (error) {
      console.error('Failed to fetch distribution history:', error);
      setError('Failed to load distribution history');
    } finally {
      setHistoryLoading(false);
    }
  };

  // Fetch distribution details
  const fetchDistributionDetails = async (distributionId) => {
    try {
      setDetailsLoading(true);
      const response = await adminAPI.getDistributionDetails(distributionId);
      setSelectedDistribution(response.data.distribution);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Failed to fetch distribution details:', error);
      setError('Failed to load distribution details');
    } finally {
      setDetailsLoading(false);
    }
  };

  // Close details modal
  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedDistribution(null);
  };

  // Handle user selection
  const handleUserSelect = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  // Handle select all users
  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user._id));
    }
  };

  // Handle token distribution
  const handleDistribute = async () => {
    if (selectedUsers.length === 0) {
      setError('Please select at least one user');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!adminMessage.trim()) {
      setError('Please enter an admin message');
      return;
    }

    try {
      setDistributing(true);
      setError(null);

      const response = await adminAPI.distributeTokens({
        userIds: selectedUsers,
        tokenType,
        amount: parseFloat(amount),
        adminMessage: adminMessage.trim()
      });

      setSuccess(`Successfully distributed ${amount} ${tokenType} to ${response.data.distribution.successfulRecipients} users`);
      
      // Reset form
      setSelectedUsers([]);
      setAmount('');
      setAdminMessage('');
      
      // Refresh users list to show updated balances
      fetchUsers(currentPage, searchTerm);
      
      // If on history tab, refresh history
      if (activeTab === 'history') {
        fetchDistributionHistory(historyPage);
      }

    } catch (error) {
      console.error('Distribution failed:', error);
      setError(error.response?.data?.message || 'Failed to distribute tokens');
    } finally {
      setDistributing(false);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers(1, searchTerm);
  };

  // Clear messages
  const clearMessages = () => {
    setSuccess(null);
    setError(null);
  };

  // Load initial data
  useEffect(() => {
    if (activeTab === 'distribute') {
      fetchUsers();
    } else if (activeTab === 'history') {
      fetchDistributionHistory();
    }
  }, [activeTab]);

  // Handle history filter changes
  useEffect(() => {
    if (activeTab === 'history') {
      setHistoryPage(1);
      fetchDistributionHistory(1);
    }
  }, [historyFilters]);

  const tokenConfig = {
    HSC: {
      name: 'HSC Tokens',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      icon: '🪙'
    },
    HSG: {
      name: 'HSG Gems',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      icon: '💎'
    },
    HSD: {
      name: 'HSD Diamonds',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      icon: '💍'
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Token Distribution
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Distribute HSC, HSG, and HSD tokens to users with personalized messages
        </p>
      </div>

      {/* Success/Error Messages */}
      {(success || error) && (
        <div className={`p-4 rounded-lg flex items-center justify-between ${
          success ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <div className="flex items-center">
            {success ? <CheckCircle className="w-5 h-5 mr-2" /> : <AlertCircle className="w-5 h-5 mr-2" />}
            <span>{success || error}</span>
          </div>
          <button onClick={clearMessages} className="text-gray-500 hover:text-gray-700">
            ×
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('distribute')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'distribute'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Gift className="w-4 h-4 inline mr-2" />
            Distribute Tokens
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'history'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <History className="w-4 h-4 inline mr-2" />
            Distribution History
          </button>
        </nav>
      </div>

      {/* Distribute Tab */}
      {activeTab === 'distribute' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Selection */}
          <div className="lg:col-span-2">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Select Users ({selectedUsers.length} selected)
                </h3>
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  {selectedUsers.length === users.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              {/* Search */}
              <form onSubmit={handleSearch} className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </form>

              {/* Users List */}
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader className="w-6 h-6 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600">Loading users...</span>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {users.map((user) => (
                    <div
                      key={user._id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedUsers.includes(user._id)
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleUserSelect(user._id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <div className={`w-4 h-4 rounded border-2 mr-3 flex items-center justify-center ${
                              selectedUsers.includes(user._id)
                                ? 'bg-blue-600 border-blue-600'
                                : 'border-gray-300'
                            }`}>
                              {selectedUsers.includes(user._id) && (
                                <CheckCircle className="w-3 h-3 text-white" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                {user.name}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          <div className="text-blue-600 font-medium">
                            {user.hscBalance} HSC
                          </div>
                          <div className="text-green-600 font-medium">
                            {user.hsgBalance} HSG
                          </div>
                          <div className="text-purple-600 font-medium">
                            {user.hsdBalance} HSD
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-600">
                    Showing {users.length} of {totalUsers} users
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => fetchUsers(currentPage - 1, searchTerm)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm border rounded disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1 text-sm">
                      {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => fetchUsers(currentPage + 1, searchTerm)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm border rounded disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Distribution Form */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Distribution Details
              </h3>

              {/* Token Type Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Token Type
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {Object.entries(tokenConfig).map(([type, config]) => (
                    <button
                      key={type}
                      onClick={() => setTokenType(type)}
                      className={`p-3 border-2 rounded-lg text-left transition-colors ${
                        tokenType === type
                          ? `${config.borderColor} ${config.bgColor}`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="text-lg mr-2">{config.icon}</span>
                        <div>
                          <div className={`font-medium ${tokenType === type ? config.color : 'text-gray-900 dark:text-white'}`}>
                            {config.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {type}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount per User
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Admin Message */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Admin Message
                </label>
                <textarea
                  value={adminMessage}
                  onChange={(e) => setAdminMessage(e.target.value)}
                  placeholder="Enter a congratulations message for the users..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {adminMessage.length}/500 characters
                </div>
              </div>

              {/* Distribution Summary */}
              {selectedUsers.length > 0 && amount && (
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Distribution Summary
                  </h4>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <div>Selected Users: {selectedUsers.length}</div>
                    <div>Amount per User: {amount} {tokenType}</div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      Total Distribution: {selectedUsers.length * parseFloat(amount || 0)} {tokenType}
                    </div>
                  </div>
                </div>
              )}

              {/* Distribute Button */}
              <button
                onClick={handleDistribute}
                disabled={distributing || selectedUsers.length === 0 || !amount || !adminMessage.trim()}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {distributing ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin mr-2" />
                    Distributing...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Distribute Tokens
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Filter History
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Token Type
                </label>
                <select
                  value={historyFilters.tokenType}
                  onChange={(e) => setHistoryFilters(prev => ({ ...prev, tokenType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Token Types</option>
                  <option value="HSC">HSC Tokens</option>
                  <option value="HSG">HSG Gems</option>
                  <option value="HSD">HSD Diamonds</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={historyFilters.status}
                  onChange={(e) => setHistoryFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Statuses</option>
                  <option value="completed">Completed</option>
                  <option value="partial">Partial</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>
          </div>

          {/* History List */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Distribution History
            </h3>

            {historyLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="w-6 h-6 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Loading history...</span>
              </div>
            ) : distributionHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No distribution history found
              </div>
            ) : (
              <div className="space-y-4">
                {distributionHistory.map((distribution) => {
                  const config = tokenConfig[distribution.tokenType];
                  const statusColors = {
                    completed: 'text-green-600 bg-green-50 border-green-200',
                    partial: 'text-yellow-600 bg-yellow-50 border-yellow-200',
                    failed: 'text-red-600 bg-red-50 border-red-200'
                  };

                  return (
                    <div key={distribution._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <span className="text-lg mr-2">{config.icon}</span>
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {distribution.amount} {distribution.tokenType} to {distribution.totalRecipients} users
                            </h4>
                            <span className={`ml-3 px-2 py-1 text-xs font-medium rounded-full border ${statusColors[distribution.distributionStatus]}`}>
                              {distribution.distributionStatus}
                            </span>
                          </div>

                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            <strong>Admin:</strong> {distribution.adminUsername} •
                            <strong> Date:</strong> {new Date(distribution.createdAt).toLocaleDateString()} {new Date(distribution.createdAt).toLocaleTimeString()}
                          </div>

                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            <strong>Message:</strong> "{distribution.adminMessage}"
                          </div>

                          <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center text-green-600">
                              <UserCheck className="w-4 h-4 mr-1" />
                              {distribution.recipients.length} successful
                            </div>
                            {distribution.failedRecipients && distribution.failedRecipients.length > 0 && (
                              <div className="flex items-center text-red-600">
                                <UserX className="w-4 h-4 mr-1" />
                                {distribution.failedRecipients.length} failed
                              </div>
                            )}
                            <div className="text-gray-600">
                              Total: {distribution.totalAmountDistributed} {distribution.tokenType}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => fetchDistributionDetails(distribution._id)}
                          disabled={detailsLoading}
                          className="ml-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                          title="View Details"
                        >
                          {detailsLoading ? (
                            <Loader className="w-4 h-4 animate-spin" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* History Pagination */}
            {historyTotalPages > 1 && (
              <div className="flex items-center justify-center mt-6 space-x-2">
                <button
                  onClick={() => fetchDistributionHistory(historyPage - 1)}
                  disabled={historyPage === 1}
                  className="px-3 py-1 text-sm border rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm">
                  {historyPage} of {historyTotalPages}
                </span>
                <button
                  onClick={() => fetchDistributionHistory(historyPage + 1)}
                  disabled={historyPage === historyTotalPages}
                  className="px-3 py-1 text-sm border rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Distribution Details Modal */}
      {showDetailsModal && selectedDistribution && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full mx-4 shadow-2xl transform transition-all max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-2xl p-6 text-center relative">
              <button
                onClick={closeDetailsModal}
                className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors p-1"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="flex items-center justify-center mb-4">
                <span className="text-3xl mr-3">{tokenConfig[selectedDistribution.tokenType].icon}</span>
                <div>
                  <h3 className="text-2xl font-bold text-white">Distribution Details</h3>
                  <p className="text-white text-opacity-90">
                    {selectedDistribution.amount} {selectedDistribution.tokenType} to {selectedDistribution.totalRecipients} users
                  </p>
                </div>
              </div>

              <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                selectedDistribution.distributionStatus === 'completed'
                  ? 'bg-green-100 text-green-800'
                  : selectedDistribution.distributionStatus === 'partial'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {selectedDistribution.distributionStatus.toUpperCase()}
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Distribution Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Distribution Info</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Admin:</span>
                      <span className="font-medium">{selectedDistribution.adminUsername}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Date:</span>
                      <span className="font-medium">
                        {new Date(selectedDistribution.createdAt).toLocaleDateString()} {new Date(selectedDistribution.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Token Type:</span>
                      <span className="font-medium">{selectedDistribution.tokenType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Amount per User:</span>
                      <span className="font-medium">{selectedDistribution.amount}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Total Recipients:</span>
                      <span className="font-medium">{selectedDistribution.totalRecipients}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Successful:</span>
                      <span className="font-medium text-green-600">{selectedDistribution.recipients.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Failed:</span>
                      <span className="font-medium text-red-600">
                        {selectedDistribution.failedRecipients ? selectedDistribution.failedRecipients.length : 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Total Distributed:</span>
                      <span className="font-medium">{selectedDistribution.totalAmountDistributed} {selectedDistribution.tokenType}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Admin Message */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.001 8.001 0 01-7.7-6M3 12c0-4.418 3.582-8 8-8s8 3.582 8 8" />
                  </svg>
                  Admin Message
                </h4>
                <p className="text-gray-700 dark:text-gray-300 italic">
                  "{selectedDistribution.adminMessage}"
                </p>
              </div>

              {/* Recipients List */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <UserCheck className="w-5 h-5 mr-2 text-green-600" />
                  Successful Recipients ({selectedDistribution.recipients.length})
                </h4>
                <div className="max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div className="grid grid-cols-1 divide-y divide-gray-200 dark:divide-gray-600">
                    {selectedDistribution.recipients.map((recipient, index) => (
                      <div key={index} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {recipient.userName}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {recipient.userEmail}
                            </div>
                          </div>
                          <div className="text-right text-sm">
                            <div className="text-gray-600 dark:text-gray-400">
                              {recipient.balanceBefore} → {recipient.balanceAfter} {selectedDistribution.tokenType}
                            </div>
                            <div className="text-green-600 font-medium">
                              +{selectedDistribution.amount} {selectedDistribution.tokenType}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Failed Recipients (if any) */}
              {selectedDistribution.failedRecipients && selectedDistribution.failedRecipients.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <UserX className="w-5 h-5 mr-2 text-red-600" />
                    Failed Recipients ({selectedDistribution.failedRecipients.length})
                  </h4>
                  <div className="max-h-40 overflow-y-auto border border-red-200 dark:border-red-600 rounded-lg">
                    <div className="grid grid-cols-1 divide-y divide-red-200 dark:divide-red-600">
                      {selectedDistribution.failedRecipients.map((failed, index) => (
                        <div key={index} className="p-3 bg-red-50 dark:bg-red-900/20">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {failed.userName || 'Unknown User'}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                {failed.userEmail || 'Unknown Email'}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-red-600 font-medium">
                                {failed.error}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Close Button */}
              <div className="flex justify-end">
                <button
                  onClick={closeDetailsModal}
                  className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
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

export default TokenDistribution;
