import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  TrendingUp, 
  DollarSign,
  UserCheck,
  UserPlus,
  Activity,
  AlertCircle
} from 'lucide-react';
import { adminAPI } from '../config/api';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
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
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Active Ads</span>
              <span className="text-sm font-semibold text-green-600">
                {dashboardData?.advertisements?.active || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Pending Approval</span>
              <span className="text-sm font-semibold text-yellow-600">
                {dashboardData?.advertisements?.pending || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Ads</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {dashboardData?.advertisements?.total || 0}
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
          <button className="btn-primary flex items-center justify-center space-x-2">
            <DollarSign className="w-4 h-4" />
            <span>Update HSC Value</span>
          </button>
          <button className="btn-secondary flex items-center justify-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Manage Users</span>
          </button>
          <button className="btn-secondary flex items-center justify-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>View Advertisements</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Activity
        </h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Activity className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                System initialized successfully
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Admin panel is ready for use
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
