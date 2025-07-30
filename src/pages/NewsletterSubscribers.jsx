import React, { useState, useEffect } from 'react';
import {
  Mail,
  Search,
  Filter,
  Download,
  Trash2,
  Send,
  Users,
  UserCheck,
  UserX,
  Calendar,
  CheckSquare,
  Square,
  Eye,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { adminAPI } from '../config/api';

const NewsletterSubscribers = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSubscribers, setSelectedSubscribers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  
  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSubscribers, setTotalSubscribers] = useState(0);
  
  // Email sending modal
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [sendToAll, setSendToAll] = useState(false);

  // Fetch subscribers
  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 20,
        search: searchTerm,
        status: statusFilter,
        sortBy: 'subscriptionDate',
        sortOrder: 'desc'
      };

      const response = await adminAPI.getNewsletterSubscribers(params);
      setSubscribers(response.data.subscribers);
      setTotalPages(response.data.pagination.pages);
      setTotalSubscribers(response.data.pagination.total);
      setStats(response.data.stats);
      setError('');
    } catch (error) {
      console.error('Error fetching subscribers:', error);
      setError('Failed to fetch subscribers');
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await adminAPI.getNewsletterStats();
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, [currentPage, searchTerm, statusFilter]);

  useEffect(() => {
    fetchStats();
  }, []);

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Handle status filter
  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedSubscribers([]);
    } else {
      setSelectedSubscribers(subscribers.map(sub => sub._id));
    }
    setSelectAll(!selectAll);
  };

  // Handle individual selection
  const handleSelectSubscriber = (subscriberId) => {
    if (selectedSubscribers.includes(subscriberId)) {
      setSelectedSubscribers(selectedSubscribers.filter(id => id !== subscriberId));
    } else {
      setSelectedSubscribers([...selectedSubscribers, subscriberId]);
    }
  };

  // Update subscriber status
  const updateSubscriberStatus = async (subscriberId, status) => {
    try {
      await adminAPI.updateSubscriberStatus(subscriberId, status);
      fetchSubscribers();
      fetchStats();
    } catch (error) {
      console.error('Error updating subscriber status:', error);
      setError('Failed to update subscriber status');
    }
  };

  // Delete subscriber
  const deleteSubscriber = async (subscriberId) => {
    if (window.confirm('Are you sure you want to delete this subscriber?')) {
      try {
        await adminAPI.deleteSubscriber(subscriberId);
        fetchSubscribers();
        fetchStats();
      } catch (error) {
        console.error('Error deleting subscriber:', error);
        setError('Failed to delete subscriber');
      }
    }
  };

  // Send newsletter
  const handleSendNewsletter = async () => {
    if (!emailSubject.trim() || !emailBody.trim()) {
      setError('Please provide both subject and body for the email');
      return;
    }

    if (!sendToAll && selectedSubscribers.length === 0) {
      setError('Please select subscribers or choose to send to all');
      return;
    }

    setSendingEmail(true);
    try {
      const data = {
        subject: emailSubject,
        body: emailBody,
        sendToAll,
        subscriberIds: sendToAll ? [] : selectedSubscribers
      };

      const response = await adminAPI.sendNewsletter(data);
      
      setShowEmailModal(false);
      setEmailSubject('');
      setEmailBody('');
      setSelectedSubscribers([]);
      setSelectAll(false);
      setSendToAll(false);
      
      alert(`Newsletter sent successfully! ${response.data.successCount} emails sent, ${response.data.failureCount} failed.`);
    } catch (error) {
      console.error('Error sending newsletter:', error);
      setError('Failed to send newsletter');
    } finally {
      setSendingEmail(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const badges = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      unsubscribed: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      bounced: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${badges[status] || badges.active}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading && subscribers.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Newsletter Subscribers</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your newsletter subscribers and send campaigns</p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => setShowEmailModal(true)}
            disabled={!sendToAll && selectedSubscribers.length === 0}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            <span>Send Newsletter</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <span className="text-red-800 dark:text-red-200">{error}</span>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Subscribers</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <UserCheck className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Unsubscribed</p>
                <p className="text-2xl font-bold text-red-600">{stats.byStatus?.unsubscribed || 0}</p>
              </div>
              <UserX className="w-8 h-8 text-red-600" />
            </div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Recent (30 days)</p>
                <p className="text-2xl font-bold text-purple-600">{stats.recent}</p>
              </div>
              <Calendar className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by email..."
                value={searchTerm}
                onChange={handleSearch}
                className="input pl-10"
              />
            </div>
          </div>
          
          {/* Status Filter */}
          <div className="flex space-x-2">
            {['all', 'active', 'unsubscribed', 'bounced'].map((status) => (
              <button
                key={status}
                onClick={() => handleStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  statusFilter === status
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Subscribers Table */}
      <div className="card">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Subscribers ({totalSubscribers})
            </h3>

            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <input
                  type="checkbox"
                  checked={sendToAll}
                  onChange={(e) => setSendToAll(e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span>Send to all active subscribers</span>
              </label>

              {selectedSubscribers.length > 0 && (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedSubscribers.length} selected
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={handleSelectAll}
                    className="flex items-center space-x-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    {selectAll ? (
                      <CheckSquare className="w-4 h-4" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                    <span>Select</span>
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Subscribed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Emails Sent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {subscribers.map((subscriber) => (
                <tr key={subscriber._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleSelectSubscriber(subscriber._id)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {selectedSubscribers.includes(subscriber._id) ? (
                        <CheckSquare className="w-4 h-4 text-primary-600" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {subscriber.email}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(subscriber.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(subscriber.subscriptionDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                      {subscriber.source?.replace('_', ' ') || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {subscriber.emailsSent || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {subscriber.status === 'active' ? (
                        <button
                          onClick={() => updateSubscriberStatus(subscriber._id, 'unsubscribed')}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title="Unsubscribe"
                        >
                          <UserX className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => updateSubscriberStatus(subscriber._id, 'active')}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                          title="Reactivate"
                        >
                          <UserCheck className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteSubscriber(subscriber._id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing page {currentPage} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Send Newsletter
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {sendToAll
                  ? `Sending to all ${stats?.active || 0} active subscribers`
                  : `Sending to ${selectedSubscribers.length} selected subscribers`
                }
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Enter email subject..."
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Body (HTML supported)
                </label>
                <textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  placeholder="Enter your email content here..."
                  rows={12}
                  className="input w-full resize-none"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowEmailModal(false);
                  setEmailSubject('');
                  setEmailBody('');
                }}
                className="btn-secondary"
                disabled={sendingEmail}
              >
                Cancel
              </button>
              <button
                onClick={handleSendNewsletter}
                disabled={sendingEmail || !emailSubject.trim() || !emailBody.trim()}
                className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sendingEmail ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Newsletter</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsletterSubscribers;
