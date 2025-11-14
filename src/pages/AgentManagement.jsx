import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Calendar,
  Mail,
  CreditCard,
  TrendingUp,
  Award,
  Shield,
  ShieldCheck,
  ShieldAlert,
  X,
  RefreshCw,
  DollarSign
} from 'lucide-react';
import { adminAPI } from '../config/api';

const AgentManagement = () => {
  const [agents, setAgents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [promoCodeTypeFilter, setPromoCodeTypeFilter] = useState('all');
  const [isActiveFilter, setIsActiveFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAgents, setTotalAgents] = useState(0);

  // Detail modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [agentDetails, setAgentDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Fetch agents
  const fetchAgents = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 20,
        search: searchTerm,
        promoCodeType: promoCodeTypeFilter,
        isActive: isActiveFilter
      };

      const response = await adminAPI.getAgents(params);
      setAgents(response.data.agents);
      setTotalPages(response.data.pagination.pages);
      setTotalAgents(response.data.pagination.total);
      setStats(response.data.stats);
      setError('');
    } catch (error) {
      console.error('Error fetching agents:', error);
      setError('Failed to fetch agents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, [currentPage, searchTerm, promoCodeTypeFilter, isActiveFilter]);

  // Fetch agent details
  const handleViewDetails = async (agent) => {
    setSelectedAgent(agent);
    setShowDetailModal(true);
    setLoadingDetails(true);

    try {
      const response = await adminAPI.getAgentDetails(agent._id);
      console.log('Agent Details Response:', response.data);
      console.log('Total Earnings from API:', response.data.totalEarnings);
      setAgentDetails(response.data);
    } catch (error) {
      console.error('Error fetching agent details:', error);
      setError('Failed to fetch agent details');
    } finally {
      setLoadingDetails(false);
    }
  };

  // Toggle agent status
  const handleToggleStatus = async (agentId, currentStatus) => {
    if (!window.confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this agent?`)) {
      return;
    }

    try {
      await adminAPI.updateAgentStatus(agentId, !currentStatus);
      fetchAgents();
      if (showDetailModal && selectedAgent?._id === agentId) {
        handleViewDetails({ ...selectedAgent, isActive: !currentStatus });
      }
    } catch (error) {
      console.error('Error updating agent status:', error);
      alert('Failed to update agent status');
    }
  };

  // Get promo code type badge color
  const getPromoCodeTypeBadge = (type) => {
    const badges = {
      silver: 'bg-gray-100 text-gray-800 border border-gray-300',
      gold: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
      diamond: 'bg-blue-100 text-blue-800 border border-blue-300',
      free: 'bg-green-100 text-green-800 border border-green-300'
    };
    return badges[type] || 'bg-gray-100 text-gray-800';
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Agents & PromoCodes Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View and manage all promo code agents
          </p>
        </div>
        <button
          onClick={fetchAgents}
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
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Agents</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
              <Users className="w-10 h-10 text-blue-500" />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Agents</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Inactive Agents</p>
                <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
              </div>
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Verified Agents</p>
                <p className="text-2xl font-bold text-purple-600">{stats.verified}</p>
              </div>
              <ShieldCheck className="w-10 h-10 text-purple-500" />
            </div>
          </div>
        </div>
      )}

      {/* Promo Code Type Stats */}
      {stats?.byType && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Agents by Promo Code Type
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Silver</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.byType.silver}</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Gold</p>
              <p className="text-xl font-bold text-yellow-600">{stats.byType.gold}</p>
            </div>
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Diamond</p>
              <p className="text-xl font-bold text-blue-600">{stats.byType.diamond}</p>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Free</p>
              <p className="text-xl font-bold text-green-600">{stats.byType.free}</p>
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
                placeholder="Search by email, promo code, or name..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Promo Code Type Filter */}
          <div className="w-full lg:w-48">
            <select
              value={promoCodeTypeFilter}
              onChange={(e) => {
                setPromoCodeTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Types</option>
              <option value="silver">Silver</option>
              <option value="gold">Gold</option>
              <option value="diamond">Diamond</option>
              <option value="free">Free</option>
            </select>
          </div>

          {/* Active Status Filter */}
          <div className="w-full lg:w-48">
            <select
              value={isActiveFilter}
              onChange={(e) => {
                setIsActiveFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="true">Active Only</option>
              <option value="false">Inactive Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Agents Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Agent Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Promo Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Code Earnings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Referrals
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Expiration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <div className="flex justify-center items-center space-x-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
                      <span className="text-gray-500 dark:text-gray-400">Loading agents...</span>
                    </div>
                  </td>
                </tr>
              ) : agents.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No agents found</p>
                  </td>
                </tr>
              ) : (
                agents.map((agent) => (
                  <tr key={agent._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{agent.userName}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{agent.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">
                        {agent.promoCode}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getPromoCodeTypeBadge(agent.promoCodeType)}`}>
                        {agent.promoCodeType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          agent.isActive
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          {agent.isActive ? (
                            <><CheckCircle className="w-3 h-3 mr-1" /> Active</>
                          ) : (
                            <><XCircle className="w-3 h-3 mr-1" /> Inactive</>
                          )}
                        </span>
                        {agent.isVerified && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                            <ShieldCheck className="w-3 h-3 mr-1" /> Verified
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-gray-900 dark:text-white">
                        <DollarSign className="w-4 h-4 mr-1 text-green-500" />
                        {formatCurrency(agent.totalEarnings || 0)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-gray-900 dark:text-white">
                        <Users className="w-4 h-4 mr-1 text-blue-500" />
                        {agent.totalReferrals || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className={`${new Date(agent.expirationDate) < new Date() ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                          {formatDate(agent.expirationDate)}
                        </p>
                        {new Date(agent.expirationDate) < new Date() && (
                          <span className="text-xs text-red-500">Expired</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewDetails(agent)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(agent._id, agent.isActive)}
                          className={`p-2 rounded-lg transition-colors ${
                            agent.isActive
                              ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                              : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                          }`}
                          title={agent.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {agent.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing page {currentPage} of {totalPages} ({totalAgents} total agents)
          </p>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Agent Detail Modal */}
      {showDetailModal && selectedAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Agent Details
              </h2>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedAgent(null);
                  setAgentDetails(null);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {loadingDetails ? (
                <div className="flex justify-center items-center py-12">
                  <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
                </div>
              ) : agentDetails ? (
                <>
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                        <Users className="w-5 h-5 mr-2" />
                        Basic Information
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm text-gray-500 dark:text-gray-400">Name</label>
                          <p className="font-medium text-gray-900 dark:text-white">{agentDetails.agent.userName}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 dark:text-gray-400">Email</label>
                          <p className="font-medium text-gray-900 dark:text-white">{agentDetails.agent.email}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 dark:text-gray-400">Contact Number</label>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {agentDetails.agent.userId?.contactNumber || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 dark:text-gray-400">Promo Code</label>
                          <p className="font-mono font-bold text-blue-600 dark:text-blue-400 text-lg">
                            {agentDetails.agent.promoCode}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 dark:text-gray-400">Promo Code Type</label>
                          <p>
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold uppercase ${getPromoCodeTypeBadge(agentDetails.agent.promoCodeType)}`}>
                              {agentDetails.agent.promoCodeType}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                        <Award className="w-5 h-5 mr-2" />
                        Status & Performance
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm text-gray-500 dark:text-gray-400">Status</label>
                          <p>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                              agentDetails.agent.isActive
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                            }`}>
                              {agentDetails.agent.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 dark:text-gray-400">Verification Status</label>
                          <p>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                              agentDetails.agent.isVerified
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                            }`}>
                              {agentDetails.agent.isVerified ? (
                                <><ShieldCheck className="w-4 h-4 mr-1" /> Verified</>
                              ) : (
                                <><ShieldAlert className="w-4 h-4 mr-1" /> {agentDetails.agent.verificationStatus || 'Pending'}</>
                              )}
                            </span>
                          </p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 dark:text-gray-400">Agent's Total Earnings</label>
                          <p className="font-bold text-green-600 dark:text-green-400 text-xl">
                            {formatCurrency(agentDetails.totalEarnings || 0)}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 dark:text-gray-400">Total Referrals</label>
                          <p className="font-bold text-blue-600 dark:text-blue-400 text-xl">
                            {agentDetails.agent.totalReferrals || 0}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 dark:text-gray-400">Promo Code Used Count</label>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {agentDetails.agent.usedCount || 0} times
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-4">
                      <Calendar className="w-5 h-5 mr-2" />
                      Important Dates
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm text-gray-500 dark:text-gray-400">Created At</label>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {formatDate(agentDetails.agent.createdAt)}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500 dark:text-gray-400">Expiration Date</label>
                        <p className={`font-medium ${new Date(agentDetails.agent.expirationDate) < new Date() ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                          {formatDate(agentDetails.agent.expirationDate)}
                          {new Date(agentDetails.agent.expirationDate) < new Date() && (
                            <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Expired</span>
                          )}
                        </p>
                      </div>
                      {agentDetails.agent.verificationCompletedAt && (
                        <div>
                          <label className="text-sm text-gray-500 dark:text-gray-400">Verified At</label>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {formatDate(agentDetails.agent.verificationCompletedAt)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* User Account Balance */}
                  {agentDetails.agent.userId && (
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-4">
                        <CreditCard className="w-5 h-5 mr-2" />
                        Account Balance
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                          <label className="text-sm text-gray-600 dark:text-gray-400">HSC Balance</label>
                          <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                            {agentDetails.agent.userId.hscBalance || 0}
                          </p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                          <label className="text-sm text-gray-600 dark:text-gray-400">HSG Balance</label>
                          <p className="text-xl font-bold text-gray-600 dark:text-gray-400">
                            {agentDetails.agent.userId.hsgBalance || 0}
                          </p>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                          <label className="text-sm text-gray-600 dark:text-gray-400">HSD Balance</label>
                          <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                            {agentDetails.agent.userId.hsdBalance || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Recent Earnings */}
                  {agentDetails.earnings && agentDetails.earnings.length > 0 && (
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-4">
                        <TrendingUp className="w-5 h-5 mr-2" />
                        Recent Earnings (Last 20)
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Date</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Buyer</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Type</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Amount</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {agentDetails.earnings.map((earning, index) => (
                              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                                  {formatDate(earning.createdAt)}
                                </td>
                                <td className="px-4 py-2 text-sm">
                                  <div>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                      {earning.buyerId?.name || 'N/A'}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      {earning.buyerId?.email || 'N/A'}
                                    </p>
                                  </div>
                                </td>
                                <td className="px-4 py-2 text-sm">
                                  <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 rounded text-xs">
                                    {earning.type}
                                  </span>
                                </td>
                                <td className="px-4 py-2 text-sm font-semibold text-green-600 dark:text-green-400">
                                  {formatCurrency(earning.amount)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Additional Info */}
                  {(agentDetails.agent.usedPromoCode || agentDetails.agent.isSelling) && (
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Additional Information
                      </h3>
                      <div className="space-y-3">
                        {agentDetails.agent.usedPromoCode && (
                          <div>
                            <label className="text-sm text-gray-500 dark:text-gray-400">Used Promo Code</label>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {agentDetails.agent.usedPromoCode}
                              {agentDetails.agent.usedPromoCodeOwner && (
                                <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                                  (Owner: {agentDetails.agent.usedPromoCodeOwner})
                                </span>
                              )}
                            </p>
                          </div>
                        )}
                        {agentDetails.agent.isSelling && (
                          <div>
                            <label className="text-sm text-gray-500 dark:text-gray-400">Selling Status</label>
                            <p className="font-medium text-gray-900 dark:text-white">
                              Listed for sale at {agentDetails.agent.sellingPrice} HSC
                              {agentDetails.agent.sellingDescription && (
                                <span className="block text-sm text-gray-500 dark:text-gray-400 mt-1">
                                  {agentDetails.agent.sellingDescription}
                                </span>
                              )}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">No details available</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-700 px-6 py-4 flex justify-end space-x-3 border-t border-gray-200 dark:border-gray-600">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedAgent(null);
                  setAgentDetails(null);
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
              {selectedAgent && (
                <button
                  onClick={() => handleToggleStatus(selectedAgent._id, selectedAgent.isActive)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedAgent.isActive
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {selectedAgent.isActive ? 'Deactivate Agent' : 'Activate Agent'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentManagement;

