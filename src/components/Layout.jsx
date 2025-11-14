import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  Sun,
  Moon,
  LogOut,
  Shield,
  LayoutDashboard,
  DollarSign,
  Users,
  FileText,
  Package,
  Calendar,
  Settings,
  Gift,
  CreditCard,
  TrendingUp,
  MapPin,
  Crown,
  Briefcase,
  Mail,
  Heart,
  UserCheck,
  Wallet,
  Database,
  ArrowLeftRight,
  Receipt
} from 'lucide-react';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { useTheme } from '../contexts/ThemeContext';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { admin, logout } = useAdminAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const navigationItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Token Management (HSC, HSG, HSD)',
      path: '/hsc-management',
      icon: DollarSign,
    },
    {
      name: 'Token Distribution',
      path: '/token-distribution',
      icon: Gift,
    },
    {
      name: 'User Management',
      path: '/users',
      icon: Users,
    },
    {
      name: 'Promo Codes Configurations',
      path: '/promo-codes',
      icon: Gift,
    },
    {
      name: 'Agents & PromoCodes Management',
      path: '/agents',
      icon: UserCheck,
    },
    {
      name: 'Claiming Requests',
      path: '/claiming-requests',
      icon: CreditCard,
    },
    {
      name: 'HSC Earned Claims',
      path: '/hsc-earned-claims',
      icon: TrendingUp,
    },
    {
      name: 'All Users HSC Earn Records',
      path: '/all-hsc-earned-records',
      icon: Database,
    },
    {
      name: 'Donation Withdrawals',
      path: '/donation-withdrawals',
      icon: Heart,
    },
    {
      name: 'Paid Donation Funds',
      path: '/paid-donation-funds',
      icon: DollarSign,
    },
    {
      name: 'Destinations',
      path: '/destinations',
      icon: MapPin,
    },
    {
      name: 'Locations',
      path: '/locations',
      icon: MapPin,
    },
    {
      name: 'Advertisement Slot Charges',
      path: '/advertisements',
      icon: FileText,
    },
    {
      name: 'HSC Packages',
      path: '/packages',
      icon: Package,
    },
    {
      name: 'Membership Settings',
      path: '/membership-settings',
      icon: Crown,
    },
    {
      name: 'Commercial Partner Settings',
      path: '/commercial-partner-settings',
      icon: Briefcase,
    },
    {
      name: 'Customize Tour Package',
      path: '/customize-tour-package',
      icon: Package,
    },
    {
      name: 'Customize Event Request',
      path: '/customize-event-request',
      icon: Calendar,
    },
    {
      name: 'Newsletter Subscribers & Email manager',
      path: '/newsletter-subscribers',
      icon: Mail,
    },
    {
      name: 'All Users Earnings',
      path: '/all-earnings',
      icon: Wallet,
    },
    {
      name: 'Users Transaction Records',
      path: '/users-transaction-records',
      icon: ArrowLeftRight,
    },
    {
      name: 'All Payment Activities & Company Profit',
      path: '/payment-activities',
      icon: Receipt,
    }
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Menu Button */}
            <div className="flex items-center">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              
              <div className="flex items-center space-x-3 ml-2 lg:ml-0">
                <div className="w-8 h-8 bg-gradient-to-r from-admin-600 to-admin-700 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                    Admin Panel
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Holidaysri.com
                  </p>
                </div>
              </div>
            </div>

            {/* Right side items */}
            <div className="flex items-center space-x-4">
              {/* Theme toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                aria-label="Toggle theme"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Admin info */}
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {admin?.username}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Administrator
                  </p>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <div className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 
          border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          mt-16 lg:mt-0
        `}>
          <div className="p-6">
            <nav className="space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`admin-sidebar-item ${isActive(item.path) ? 'active' : ''}`}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 lg:ml-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
