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
  CheckCircle,
  Link,
  Plus,
  X,
  Globe,
  UserPlus
} from 'lucide-react';
import { adminAPI } from '../config/api';

const NewsletterSubscribers = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSubscribers, setSelectedSubscribers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Tab management
  const [activeTab, setActiveTab] = useState('subscribers'); // 'subscribers', 'users', 'all'

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
  const [recipientType, setRecipientType] = useState('selected');

  // Link management
  const [emailLinks, setEmailLinks] = useState([]);
  const [newLinkText, setNewLinkText] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

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
        sortOrder: 'desc',
        type: activeTab
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
  }, [currentPage, searchTerm, statusFilter, activeTab]);

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

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSelectedSubscribers([]);
    setSelectAll(false);
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

  // Link management functions
  const addLink = () => {
    if (newLinkText.trim() && newLinkUrl.trim()) {
      const linkHtml = `<a href="${newLinkUrl}" style="color: #10b981; text-decoration: none; font-weight: bold;">${newLinkText}</a>`;
      setEmailLinks([...emailLinks, { text: newLinkText, url: newLinkUrl, html: linkHtml }]);
      setNewLinkText('');
      setNewLinkUrl('');
    }
  };

  const removeLink = (index) => {
    setEmailLinks(emailLinks.filter((_, i) => i !== index));
  };

  const insertLinkIntoBody = (linkHtml) => {
    setEmailBody(emailBody + ' ' + linkHtml);
  };

  // Send newsletter
  const handleSendNewsletter = async () => {
    if (!emailSubject.trim() || !emailBody.trim()) {
      setError('Please provide both subject and body for the email');
      return;
    }

    if (recipientType === 'selected' && selectedSubscribers.length === 0) {
      setError('Please select recipients or choose a different sending option');
      return;
    }

    setSendingEmail(true);
    try {
      const data = {
        subject: emailSubject,
        body: emailBody,
        recipientType,
        subscriberIds: recipientType === 'selected' ? selectedSubscribers : []
      };

      const response = await adminAPI.sendNewsletter(data);

      setShowEmailModal(false);
      setEmailSubject('');
      setEmailBody('');
      setEmailLinks([]);
      setSelectedSubscribers([]);
      setSelectAll(false);
      setRecipientType('selected');

      const breakdown = response.data.recipientBreakdown;
      alert(`Newsletter sent successfully!\n\nTotal: ${response.data.totalRecipients} recipients\nSubscribers: ${breakdown.subscribers}\nUsers: ${breakdown.users}\n\nSent: ${response.data.successCount}\nFailed: ${response.data.failureCount}`);
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
            <span>Send Newsletter or Mail</span>
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Newsletter Subscribers</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Registered Users</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalUsers || 0}</p>
              </div>
              <UserPlus className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Contacts</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {activeTab === 'all' ? totalSubscribers : (stats.totalContacts || stats.total)}
                </p>
              </div>
              <Globe className="w-8 h-8 text-indigo-600" />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Subscribers</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <UserCheck className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Recent (30 days)</p>
                <p className="text-2xl font-bold text-orange-600">{stats.recent}</p>
              </div>
              <Calendar className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="card">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'subscribers', name: 'Newsletter Subscribers', icon: Mail, count: stats?.total || 0 },
              { id: 'users', name: 'Registered Users', icon: Users, count: stats?.totalUsers || 0 },
              { id: 'all', name: 'All Contacts', icon: Globe, count: activeTab === 'all' ? totalSubscribers : (stats?.totalContacts || 0) }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.name}</span>
                <span className={`${
                  activeTab === tab.id
                    ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                } ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

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

      {/* Contacts Table */}
      <div className="card">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {activeTab === 'subscribers' ? 'Newsletter Subscribers' :
               activeTab === 'users' ? 'Registered Users' :
               'All Contacts'} ({totalSubscribers})
            </h3>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-600 dark:text-gray-400">Send to:</label>
                <select
                  value={recipientType}
                  onChange={(e) => setRecipientType(e.target.value)}
                  className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-800"
                >
                  <option value="selected">Selected Only</option>
                  <option value="all_subscribers">All Subscribers</option>
                  <option value="all_users">All Users</option>
                  <option value="all_contacts">All Contacts</option>
                </select>
              </div>

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
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {activeTab === 'subscribers' ? 'Emails Sent' : 'Source'}
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
                    <div className="flex items-center">
                      {subscriber.profileImage && (
                        <img
                          src={subscriber.profileImage}
                          alt={subscriber.name}
                          className="w-6 h-6 rounded-full mr-2"
                        />
                      )}
                      <span className="text-sm text-gray-900 dark:text-white">
                        {subscriber.name || subscriber.email.split('@')[0]}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      subscriber.type === 'subscriber' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                      subscriber.type === 'user' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' :
                      'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    }`}>
                      {subscriber.type === 'subscriber' ? 'Newsletter' :
                       subscriber.type === 'user' ? 'User' : 'Both'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(subscriber.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(subscriber.joinedDate || subscriber.subscriptionDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {activeTab === 'subscribers' ?
                      (subscriber.emailsSent || 0) :
                      (subscriber.source?.replace('_', ' ') || 'Registered User')
                    }
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
                Send Newsletter or Mail
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {recipientType === 'selected'
                  ? `Sending to ${selectedSubscribers.length} selected recipients`
                  : recipientType === 'all_subscribers'
                  ? `Sending to all ${stats?.active || 0} active subscribers`
                  : recipientType === 'all_users'
                  ? `Sending to all ${stats?.totalUsers || 0} registered users`
                  : `Sending to all ${stats?.totalContacts || 0} contacts`
                }
              </p>
            </div>

            <div className="p-6 space-y-6">
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
                  placeholder="Enter your email content here... You can use HTML tags for formatting and insert links from above."
                  rows={12}
                  className="input w-full resize-none"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  HTML tags supported: &lt;h1&gt;, &lt;h2&gt;, &lt;p&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;a&gt;, &lt;br&gt;, etc.
                </p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowEmailModal(false);
                  setEmailSubject('');
                  setEmailBody('');
                  setEmailLinks([]);
                  setNewLinkText('');
                  setNewLinkUrl('');
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
                    <span>Send</span>
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
