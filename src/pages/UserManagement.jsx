import { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  ShieldCheck,
  ShieldAlert,
  X,
  RefreshCw,
  DollarSign,
  Crown,
  Briefcase,
  FileText,
  Image as ImageIcon,
  Calendar,
  Edit,
  Save,
  AlertCircle
} from 'lucide-react';
import { adminAPI } from '../config/api';
import ImageViewerModal from '../components/ImageViewerModal';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  // Detail modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Image viewer
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [viewerImages, setViewerImages] = useState([]);
  const [viewerInitialIndex, setViewerInitialIndex] = useState(0);

  // Verification editing
  const [editingVerification, setEditingVerification] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('');
  const [verificationNotes, setVerificationNotes] = useState('');
  const [savingVerification, setSavingVerification] = useState(false);

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);

      const params = {
        page: currentPage,
        limit: 20,
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : undefined
      };

      const response = await adminAPI.getUsers(params);
      console.log('API Response:', response.data);

      // Backend returns: { users, totalPages, currentPage, total }
      const fetchedUsers = response.data.users || [];
      setUsers(fetchedUsers);
      setTotalPages(response.data.totalPages || 1);
      setTotalUsers(response.data.total || 0);

      // Calculate stats from current page users
      const activeUsers = fetchedUsers.filter(u => u.isActive).length;
      const verifiedUsers = fetchedUsers.filter(u => u.isEmailVerified).length;
      const members = fetchedUsers.filter(u => u.isMember).length;
      const partners = fetchedUsers.filter(u => u.isPartner).length;

      setStats({
        total: response.data.total || 0,
        active: activeUsers,
        inactive: fetchedUsers.length - activeUsers,
        verified: verifiedUsers,
        members: members,
        partners: partners
      });

      setError('');
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('');  // Don't show error if data is loading
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm, statusFilter]);

  // Fetch user details
  const handleViewDetails = async (user) => {
    setSelectedUser(user);
    setShowDetailModal(true);
    setLoadingDetails(true);
    setEditingVerification(false);

    try {
      const response = await adminAPI.getUserDetails(user._id);
      setUserDetails(response.data);
      // Initialize verification state
      setVerificationStatus(response.data.user.verificationStatus || 'pending');
      setVerificationNotes(response.data.user.verificationNotes || '');
    } catch (error) {
      console.error('Error fetching user details:', error);
      setError('Failed to fetch user details');
    } finally {
      setLoadingDetails(false);
    }
  };

  // Handle verification document image viewing
  const handleViewDocuments = (documents) => {
    const images = [];
    if (documents.nicFront) {
      images.push({ url: documents.nicFront, label: 'NIC Front' });
    }
    if (documents.nicBack) {
      images.push({ url: documents.nicBack, label: 'NIC Back' });
    }
    if (documents.passport) {
      images.push({ url: documents.passport, label: 'Passport' });
    }

    if (images.length > 0) {
      setViewerImages(images);
      setViewerInitialIndex(0);
      setShowImageViewer(true);
    }
  };

  // Handle verification status update
  const handleSaveVerification = async () => {
    if (!userDetails?.user?._id) return;

    setSavingVerification(true);
    try {
      await adminAPI.updateUserVerification(
        userDetails.user._id,
        verificationStatus,
        verificationNotes
      );

      setSuccessMessage('Verification status updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);

      // Refresh user details
      const response = await adminAPI.getUserDetails(userDetails.user._id);
      setUserDetails(response.data);
      setEditingVerification(false);

      // Refresh users list
      fetchUsers();
    } catch (error) {
      console.error('Error updating verification:', error);
      setError('Failed to update verification status');
      setTimeout(() => setError(''), 3000);
    } finally {
      setSavingVerification(false);
    }
  };

  // Toggle user status
  const handleToggleStatus = async (userId, currentStatus) => {
    if (!window.confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this user?`)) {
      return;
    }

    try {
      await adminAPI.updateUserStatus(userId, !currentStatus);
      setSuccessMessage(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchUsers();
      if (showDetailModal && selectedUser?._id === userId) {
        handleViewDetails({ ...selectedUser, isActive: !currentStatus });
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      setError('Failed to update user status');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            User Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View and manage all registered users
          </p>
        </div>
        <button
          onClick={fetchUsers}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
              <Users className="w-10 h-10 text-blue-500" />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Users</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Verified Users</p>
                <p className="text-2xl font-bold text-purple-600">{stats.verified}</p>
              </div>
              <ShieldCheck className="w-10 h-10 text-purple-500" />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Members</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.members}</p>
              </div>
              <Crown className="w-10 h-10 text-yellow-500" />
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="card p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="w-full lg:w-48">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
              <option value="verified">Verified Only</option>
              <option value="unverified">Unverified Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <p className="text-green-800 dark:text-green-200">{successMessage}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Users Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  User Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Balances
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Membership
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Joined Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex justify-center items-center space-x-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
                      <span className="text-gray-500 dark:text-gray-400">Loading users...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No users found</p>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-gray-900 dark:text-white">
                          {user.countryCode} {user.contactNumber}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1">
                        {/* Active/Inactive Status Badge */}
                        <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium ${
                          user.isActive
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          {user.isActive ? (
                            <><CheckCircle className="w-3 h-3 mr-1" /> Active</>
                          ) : (
                            <><XCircle className="w-3 h-3 mr-1" /> Inactive</>
                          )}
                        </span>
                        {user.isEmailVerified && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                            <ShieldCheck className="w-3 h-3 mr-1" /> Verified
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs space-y-1">
                        <div className="flex items-center text-yellow-600 dark:text-yellow-400">
                          <DollarSign className="w-3 h-3 mr-1" />
                          <span>HSC: {user.hscBalance || 0}</span>
                        </div>
                        <div className="flex items-center text-green-600 dark:text-green-400">
                          <DollarSign className="w-3 h-3 mr-1" />
                          <span>HSG: {user.hsgBalance || 0}</span>
                        </div>
                        <div className="flex items-center text-blue-600 dark:text-blue-400">
                          <DollarSign className="w-3 h-3 mr-1" />
                          <span>HSD: {user.hsdBalance || 0}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1">
                        {user.isMember && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                            <Crown className="w-3 h-3 mr-1" /> Member
                          </span>
                        )}
                        {user.isPartner && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                            <Briefcase className="w-3 h-3 mr-1" /> Partner
                          </span>
                        )}
                        {!user.isMember && !user.isPartner && (
                          <span className="text-xs text-gray-400 dark:text-gray-500">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {formatDate(user.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {/* View Button */}
                        <button
                          onClick={() => handleViewDetails(user)}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </button>

                        {/* Toggle Switch for isActive */}
                        <button
                          onClick={() => handleToggleStatus(user._id, user.isActive)}
                          className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                            user.isActive
                              ? 'bg-green-500 focus:ring-green-500'
                              : 'bg-red-500 focus:ring-red-500'
                          }`}
                          title={user.isActive ? 'Click to deactivate' : 'Click to activate'}
                        >
                          <span
                            className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                              user.isActive ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-t border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing page {currentPage} of {totalPages} ({totalUsers} total users)
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {showDetailModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                User Details
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {loadingDetails ? (
                <div className="flex justify-center items-center py-12">
                  <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
                </div>
              ) : userDetails ? (
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="card p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-600 dark:text-gray-400">Name</label>
                        <p className="text-gray-900 dark:text-white font-medium">{userDetails.user.name}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600 dark:text-gray-400">Email</label>
                        <p className="text-gray-900 dark:text-white font-medium">{userDetails.user.email}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600 dark:text-gray-400">Contact Number</label>
                        <p className="text-gray-900 dark:text-white font-medium">
                          {userDetails.user.countryCode} {userDetails.user.contactNumber}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600 dark:text-gray-400">Account Status</label>
                        <div className="flex items-center space-x-2 mt-1">
                          <button
                            onClick={() => handleToggleStatus(userDetails.user._id, userDetails.user.isActive)}
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                              userDetails.user.isActive
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/30'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/30'
                            }`}
                          >
                            {userDetails.user.isActive ? (
                              <><CheckCircle className="w-3 h-3 mr-1" /> Active</>
                            ) : (
                              <><XCircle className="w-3 h-3 mr-1" /> Inactive</>
                            )}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600 dark:text-gray-400">Email Verified</label>
                        <p className="text-gray-900 dark:text-white font-medium">
                          {userDetails.user.isEmailVerified ? (
                            <span className="text-green-600 dark:text-green-400">✓ Verified</span>
                          ) : (
                            <span className="text-red-600 dark:text-red-400">✗ Not Verified</span>
                          )}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600 dark:text-gray-400">Joined Date</label>
                        <p className="text-gray-900 dark:text-white font-medium">{formatDate(userDetails.user.createdAt)}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600 dark:text-gray-400">Last Login</label>
                        <p className="text-gray-900 dark:text-white font-medium">{formatDate(userDetails.user.lastLogin)}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600 dark:text-gray-400">Google Account</label>
                        <p className="text-gray-900 dark:text-white font-medium">
                          {userDetails.user.googleId ? 'Yes' : 'No'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Token Balances */}
                  <div className="card p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Token Balances
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">HSC Balance</p>
                            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                              {userDetails.user.hscBalance || 0}
                            </p>
                          </div>
                          <DollarSign className="w-10 h-10 text-yellow-500" />
                        </div>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">HSG Balance</p>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                              {userDetails.user.hsgBalance || 0}
                            </p>
                          </div>
                          <DollarSign className="w-10 h-10 text-green-500" />
                        </div>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">HSD Balance</p>
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                              {userDetails.user.hsdBalance || 0}
                            </p>
                          </div>
                          <DollarSign className="w-10 h-10 text-blue-500" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Membership & Partnership */}
                  {(userDetails.user.isMember || userDetails.user.isPartner) && (
                    <div className="card p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Membership & Partnership
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {userDetails.user.isMember && (
                          <>
                            <div>
                              <label className="text-sm text-gray-600 dark:text-gray-400">Membership Type</label>
                              <p className="text-gray-900 dark:text-white font-medium capitalize">
                                <Crown className="w-4 h-4 inline mr-1 text-yellow-500" />
                                {userDetails.user.membershipType}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm text-gray-600 dark:text-gray-400">Membership Start</label>
                              <p className="text-gray-900 dark:text-white font-medium">
                                {formatDate(userDetails.user.membershipStartDate)}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm text-gray-600 dark:text-gray-400">Membership Expiration</label>
                              <p className="text-gray-900 dark:text-white font-medium">
                                {formatDate(userDetails.user.membershipExpirationDate)}
                              </p>
                            </div>
                          </>
                        )}
                        {userDetails.user.isPartner && (
                          <div>
                            <label className="text-sm text-gray-600 dark:text-gray-400">Commercial Partner</label>
                            <p className="text-gray-900 dark:text-white font-medium">
                              <Briefcase className="w-4 h-4 inline mr-1 text-blue-500" />
                              Active (Expires: {formatDate(userDetails.user.partnerExpirationDate)})
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* User Verification Section */}
                  <div className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                        <ShieldCheck className="w-5 h-5 mr-2 text-purple-500" />
                        User Verification
                      </h3>
                      {!editingVerification ? (
                        <button
                          onClick={() => setEditingVerification(true)}
                          className="inline-flex items-center px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit Status
                        </button>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={handleSaveVerification}
                            disabled={savingVerification}
                            className="inline-flex items-center px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                          >
                            <Save className="w-4 h-4 mr-1" />
                            {savingVerification ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={() => {
                              setEditingVerification(false);
                              setVerificationStatus(userDetails.user.verificationStatus || 'pending');
                              setVerificationNotes(userDetails.user.verificationNotes || '');
                            }}
                            disabled={savingVerification}
                            className="inline-flex items-center px-3 py-1.5 text-sm bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Verification Status */}
                      <div>
                        <label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">Verification Status</label>
                        {editingVerification ? (
                          <select
                            value={verificationStatus}
                            onChange={(e) => setVerificationStatus(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="pending">Pending</option>
                            <option value="verified">Verified</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        ) : (
                          <div>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                              userDetails.user.verificationStatus === 'verified'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                : userDetails.user.verificationStatus === 'rejected'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                            }`}>
                              {userDetails.user.verificationStatus === 'verified' && <ShieldCheck className="w-4 h-4 mr-1" />}
                              {userDetails.user.verificationStatus === 'rejected' && <XCircle className="w-4 h-4 mr-1" />}
                              {userDetails.user.verificationStatus === 'pending' && <ShieldAlert className="w-4 h-4 mr-1" />}
                              {userDetails.user.verificationStatus?.charAt(0).toUpperCase() + userDetails.user.verificationStatus?.slice(1)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Is Verified */}
                      <div>
                        <label className="text-sm text-gray-600 dark:text-gray-400">Verified</label>
                        <p className="text-gray-900 dark:text-white font-medium">
                          {userDetails.user.isVerified ? (
                            <span className="text-green-600 dark:text-green-400">✓ Yes</span>
                          ) : (
                            <span className="text-red-600 dark:text-red-400">✗ No</span>
                          )}
                        </p>
                      </div>

                      {/* Verification Submitted At */}
                      {userDetails.user.verificationSubmittedAt && (
                        <div>
                          <label className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                            <Calendar className="w-3.5 h-3.5 mr-1" />
                            Submitted At
                          </label>
                          <p className="text-gray-900 dark:text-white font-medium">
                            {formatDate(userDetails.user.verificationSubmittedAt)}
                          </p>
                        </div>
                      )}

                      {/* Verification Completed At */}
                      {userDetails.user.verificationCompletedAt && (
                        <div>
                          <label className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                            <Calendar className="w-3.5 h-3.5 mr-1" />
                            Completed At
                          </label>
                          <p className="text-gray-900 dark:text-white font-medium">
                            {formatDate(userDetails.user.verificationCompletedAt)}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Verification Documents */}
                    {userDetails.user.verificationDocuments && (
                      Object.values(userDetails.user.verificationDocuments).some(doc => doc) && (
                        <div className="mt-4">
                          <label className="text-sm text-gray-600 dark:text-gray-400 mb-2 flex items-center">
                            <FileText className="w-3.5 h-3.5 mr-1" />
                            Verification Documents
                          </label>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {userDetails.user.verificationDocuments.nicFront && (
                              <button
                                onClick={() => handleViewDocuments(userDetails.user.verificationDocuments)}
                                className="relative group overflow-hidden rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
                              >
                                <img
                                  src={userDetails.user.verificationDocuments.nicFront}
                                  alt="NIC Front"
                                  className="w-full h-32 object-cover"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center">
                                  <ImageIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs py-1 px-2">
                                  NIC Front
                                </div>
                              </button>
                            )}
                            {userDetails.user.verificationDocuments.nicBack && (
                              <button
                                onClick={() => handleViewDocuments(userDetails.user.verificationDocuments)}
                                className="relative group overflow-hidden rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
                              >
                                <img
                                  src={userDetails.user.verificationDocuments.nicBack}
                                  alt="NIC Back"
                                  className="w-full h-32 object-cover"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center">
                                  <ImageIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs py-1 px-2">
                                  NIC Back
                                </div>
                              </button>
                            )}
                            {userDetails.user.verificationDocuments.passport && (
                              <button
                                onClick={() => handleViewDocuments(userDetails.user.verificationDocuments)}
                                className="relative group overflow-hidden rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
                              >
                                <img
                                  src={userDetails.user.verificationDocuments.passport}
                                  alt="Passport"
                                  className="w-full h-32 object-cover"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center">
                                  <ImageIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs py-1 px-2">
                                  Passport
                                </div>
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    )}

                    {/* Verification Notes */}
                    <div className="mt-4">
                      <label className="text-sm text-gray-600 dark:text-gray-400 mb-2 flex items-center">
                        <AlertCircle className="w-3.5 h-3.5 mr-1" />
                        Admin Notes
                      </label>
                      {editingVerification ? (
                        <textarea
                          value={verificationNotes}
                          onChange={(e) => setVerificationNotes(e.target.value)}
                          rows={3}
                          placeholder="Add notes about the verification..."
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                          {userDetails.user.verificationNotes || 'No notes available'}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Bank Details */}
                  {userDetails.user.bankDetails && Object.keys(userDetails.user.bankDetails).some(key => userDetails.user.bankDetails[key]) && (
                    <div className="card p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <DollarSign className="w-5 h-5 mr-2 text-green-500" />
                        Bank Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {userDetails.user.bankDetails.bank && (
                          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                            <label className="text-sm text-gray-600 dark:text-gray-400">Bank Name</label>
                            <p className="text-gray-900 dark:text-white font-medium mt-1">{userDetails.user.bankDetails.bank}</p>
                          </div>
                        )}
                        {userDetails.user.bankDetails.branch && (
                          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                            <label className="text-sm text-gray-600 dark:text-gray-400">Branch</label>
                            <p className="text-gray-900 dark:text-white font-medium mt-1">{userDetails.user.bankDetails.branch}</p>
                          </div>
                        )}
                        {userDetails.user.bankDetails.accountNo && (
                          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                            <label className="text-sm text-gray-600 dark:text-gray-400">Account Number</label>
                            <p className="text-gray-900 dark:text-white font-medium mt-1 font-mono">{userDetails.user.bankDetails.accountNo}</p>
                          </div>
                        )}
                        {userDetails.user.bankDetails.accountName && (
                          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                            <label className="text-sm text-gray-600 dark:text-gray-400">Account Name</label>
                            <p className="text-gray-900 dark:text-white font-medium mt-1">{userDetails.user.bankDetails.accountName}</p>
                          </div>
                        )}
                        {userDetails.user.bankDetails.postalCode && (
                          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                            <label className="text-sm text-gray-600 dark:text-gray-400">Postal Code</label>
                            <p className="text-gray-900 dark:text-white font-medium mt-1">{userDetails.user.bankDetails.postalCode}</p>
                          </div>
                        )}
                        {userDetails.user.bankDetails.binanceId && (
                          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                            <label className="text-sm text-gray-600 dark:text-gray-400">Binance ID</label>
                            <p className="text-gray-900 dark:text-white font-medium mt-1 font-mono">{userDetails.user.bankDetails.binanceId}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Recent Transactions */}
                  {userDetails.recentTransactions && userDetails.recentTransactions.length > 0 && (
                    <div className="card p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Recent Transactions (Last 10)
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Type</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Amount</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Description</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {userDetails.recentTransactions.map((transaction, index) => (
                              <tr key={index}>
                                <td className="px-4 py-2 text-sm">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    transaction.type === 'credit'
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                  }`}>
                                    {transaction.type}
                                  </span>
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                                  {transaction.amount} HSC
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                                  {transaction.description}
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                                  {formatDate(transaction.createdAt)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Recent Advertisements */}
                  {userDetails.recentAdvertisements && userDetails.recentAdvertisements.length > 0 && (
                    <div className="card p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Recent Advertisements (Last 10)
                      </h3>
                      <div className="space-y-3">
                        {userDetails.recentAdvertisements.map((ad, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{ad.title}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {ad.category} • {formatDate(ad.createdAt)}
                              </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              ad.status === 'active'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                            }`}>
                              {ad.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">No details available</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-700 px-6 py-4 border-t border-gray-200 dark:border-gray-600 flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Viewer Modal */}
      {showImageViewer && (
        <ImageViewerModal
          images={viewerImages}
          initialIndex={viewerInitialIndex}
          onClose={() => setShowImageViewer(false)}
        />
      )}
    </div>
  );
};

export default UserManagement;
