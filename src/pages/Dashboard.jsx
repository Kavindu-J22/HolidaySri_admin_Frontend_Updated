import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  FileText,
  TrendingUp,
  DollarSign,
  UserCheck,
  UserPlus,
  Activity,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Wallet,
  CreditCard,
  Package,
  BarChart3,
  PieChart,
  Calendar,
  Megaphone
} from 'lucide-react';
import { adminAPI } from '../config/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentPayments, setRecentPayments] = useState([]);
  const [recentClaimRequests, setRecentClaimRequests] = useState([]);
  const [recentHSCClaims, setRecentHSCClaims] = useState([]);
  const [recentDonationWithdrawals, setRecentDonationWithdrawals] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    fetchRecentActivities();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getDashboard();
      setDashboardData(response.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      // Fetch recent payment activities
      const paymentsRes = await adminAPI.getPaymentActivities({ page: 1, limit: 5, sortBy: 'createdAt', sortOrder: 'desc' });
      setRecentPayments(paymentsRes.data.activities || []);

      // Fetch recent claiming requests
      const claimingRes = await adminAPI.getClaimRequests({ page: 1, limit: 5 });
      setRecentClaimRequests(claimingRes.data.claimRequests || []);

      // Fetch recent HSC earned claims
      const hscClaimsRes = await adminAPI.getHSCEarnedClaims({ page: 1, limit: 5 });
      setRecentHSCClaims(hscClaimsRes.data.claimRequests || []);

      // Note: Donation withdrawals use different API endpoint
      // We'll handle it separately if needed
    } catch (error) {
      console.error('Failed to fetch recent activities:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
          <span className="text-sm text-red-600 dark:text-red-400">{error}</span>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Users',
      value: dashboardData?.users?.total || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: `+${dashboardData?.users?.newToday || 0} today`
    },
    {
      title: 'Verified Users',
      value: dashboardData?.users?.verified || 0,
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: `${Math.round((dashboardData?.users?.verified / dashboardData?.users?.total) * 100) || 0}% verified`
    },
    {
      title: 'Total Advertisements',
      value: dashboardData?.advertisements?.total || 0,
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: `${dashboardData?.advertisements?.active || 0} active`
    },
    {
      title: 'HSC Transactions',
      value: dashboardData?.hsc?.totalTransactions || 0,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      change: `${dashboardData?.hsc?.totalPurchased || 0} purchased`
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Overview of your Holidaysri.com platform
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stat.value.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {stat.change}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor} dark:bg-gray-800`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* HSC Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            HSC Configuration
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-admin-50 dark:bg-admin-900/20 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Current HSC Value
                </p>
                <p className="text-xl font-bold text-admin-600 dark:text-admin-400">
                  {dashboardData?.hsc?.currentValue || 100} {dashboardData?.hsc?.currency || 'LKR'}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-admin-600 dark:text-admin-400" />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600 dark:text-gray-400">Total Purchased</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {dashboardData?.hsc?.totalPurchased || 0} HSC
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Total Spent</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {dashboardData?.hsc?.totalSpent || 0} HSC
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Advertisement Status
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Published</span>
              </div>
              <span className="text-sm font-semibold text-green-600">
                {dashboardData?.advertisements?.published || 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Active</span>
              </div>
              <span className="text-sm font-semibold text-blue-600">
                {dashboardData?.advertisements?.active || 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <XCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Expired</span>
              </div>
              <span className="text-sm font-semibold text-red-600">
                {dashboardData?.advertisements?.expired || 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-yellow-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Paused</span>
              </div>
              <span className="text-sm font-semibold text-yellow-600">
                {dashboardData?.advertisements?.paused || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/hsc-management')}
            className="btn-primary flex items-center justify-center space-x-2 hover:shadow-lg transition-shadow"
          >
            <DollarSign className="w-4 h-4" />
            <span>Update HSC Value</span>
          </button>
          <button
            onClick={() => navigate('/users')}
            className="btn-secondary flex items-center justify-center space-x-2 hover:shadow-lg transition-shadow"
          >
            <Users className="w-4 h-4" />
            <span>Manage Users</span>
          </button>
          <button
            onClick={() => navigate('/advertisements-management')}
            className="btn-secondary flex items-center justify-center space-x-2 hover:shadow-lg transition-shadow"
          >
            <Megaphone className="w-4 h-4" />
            <span>View Advertisements</span>
          </button>
        </div>
      </div>

      {/* Company Actual Earning (LKR Payments) */}
      <div className="card p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Company Actual Earning (LKR Payments)
          </h3>
          <Wallet className="w-6 h-6 text-green-600" />
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total LKR Revenue</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              LKR {(dashboardData?.companyProfit?.totalProfit || 0).toLocaleString()}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-green-200 dark:border-green-800">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">LKR Transactions</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {dashboardData?.companyProfit?.lkrTransactionCount || 0}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Avg. Transaction</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                LKR {Math.round((dashboardData?.companyProfit?.totalProfit || 0) / (dashboardData?.companyProfit?.lkrTransactionCount || 1)).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Payment Activities */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Payment Activities
          </h3>
          <button
            onClick={() => navigate('/payment-activities')}
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-3">
          {recentPayments.length > 0 ? (
            recentPayments.map((payment, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    payment.paymentMethod === 'LKR' ? 'bg-green-100 dark:bg-green-900/20' : 'bg-blue-100 dark:bg-blue-900/20'
                  }`}>
                    <CreditCard className={`w-4 h-4 ${
                      payment.paymentMethod === 'LKR' ? 'text-green-600' : 'text-blue-600'
                    }`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {payment.userId?.name || 'Unknown User'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {payment.category?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {payment.finalAmount} {payment.paymentMethod}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              No recent payment activities
            </p>
          )}
        </div>
      </div>

      {/* Recent Claiming Requests */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Claiming Requests
          </h3>
          <button
            onClick={() => navigate('/claiming-requests')}
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-3">
          {recentClaimRequests.length > 0 ? (
            recentClaimRequests.slice(0, 5).map((claim, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    claim.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                    claim.status === 'approved' ? 'bg-green-100 dark:bg-green-900/20' :
                    'bg-red-100 dark:bg-red-900/20'
                  }`}>
                    {claim.status === 'pending' ? <Clock className="w-4 h-4 text-yellow-600" /> :
                     claim.status === 'approved' ? <CheckCircle className="w-4 h-4 text-green-600" /> :
                     <XCircle className="w-4 h-4 text-red-600" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {claim.userId?.name || 'Unknown User'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {claim.userId?.email || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    LKR {(claim.claimAmount || 0).toLocaleString()}
                  </p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    claim.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                    claim.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                    'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                  }`}>
                    {claim.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              No recent claiming requests
            </p>
          )}
        </div>
      </div>

      {/* Recent HSC Earned Claims */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent HSC Earned Claims
          </h3>
          <button
            onClick={() => navigate('/hsc-earned-claims')}
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-3">
          {recentHSCClaims.length > 0 ? (
            recentHSCClaims.slice(0, 5).map((claim, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    claim.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                    claim.status === 'approved' ? 'bg-green-100 dark:bg-green-900/20' :
                    'bg-red-100 dark:bg-red-900/20'
                  }`}>
                    <TrendingUp className={`w-4 h-4 ${
                      claim.status === 'pending' ? 'text-yellow-600' :
                      claim.status === 'approved' ? 'text-green-600' :
                      'text-red-600'
                    }`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {claim.userId?.name || 'Unknown User'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {claim.hscAmount || 0} HSC → LKR {(claim.lkrAmount || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    claim.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                    claim.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                    'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                  }`}>
                    {claim.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              No recent HSC earned claims
            </p>
          )}
        </div>
      </div>

      {/* Recent Donation Withdrawal Requests */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Donation Withdrawal Requests
          </h3>
          <button
            onClick={() => navigate('/donation-withdrawals')}
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">
            Visit the Donation Withdrawal Requests page to view all requests
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Advertisement Growth Chart */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Advertisement Overview
            </h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Advertisements</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {dashboardData?.advertisements?.total || 0}
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Published</span>
                <span className="font-medium text-green-600">
                  {Math.round(((dashboardData?.advertisements?.published || 0) / (dashboardData?.advertisements?.total || 1)) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.round(((dashboardData?.advertisements?.published || 0) / (dashboardData?.advertisements?.total || 1)) * 100)}%` }}
                ></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Active</span>
                <span className="font-medium text-blue-600">
                  {Math.round(((dashboardData?.advertisements?.active || 0) / (dashboardData?.advertisements?.total || 1)) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.round(((dashboardData?.advertisements?.active || 0) / (dashboardData?.advertisements?.total || 1)) * 100)}%` }}
                ></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Expired</span>
                <span className="font-medium text-red-600">
                  {Math.round(((dashboardData?.advertisements?.expired || 0) / (dashboardData?.advertisements?.total || 1)) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-red-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.round(((dashboardData?.advertisements?.expired || 0) / (dashboardData?.advertisements?.total || 1)) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* User Statistics Chart */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              User Statistics
            </h3>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Users</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {dashboardData?.users?.total || 0}
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Verified Users</span>
                <span className="font-medium text-green-600">
                  {Math.round(((dashboardData?.users?.verified || 0) / (dashboardData?.users?.total || 1)) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.round(((dashboardData?.users?.verified || 0) / (dashboardData?.users?.total || 1)) * 100)}%` }}
                ></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">New Today</p>
                <p className="text-xl font-bold text-blue-600">
                  +{dashboardData?.users?.newToday || 0}
                </p>
              </div>
              <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Verified</p>
                <p className="text-xl font-bold text-purple-600">
                  {dashboardData?.users?.verified || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
