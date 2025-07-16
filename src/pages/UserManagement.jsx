import React from 'react';
import { Users } from 'lucide-react';

const UserManagement = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          User Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage registered users and their accounts
        </p>
      </div>

      <div className="card p-8 text-center">
        <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          User Management Coming Soon
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          This page will allow you to view, manage, and moderate user accounts.
        </p>
      </div>
    </div>
  );
};

export default UserManagement;
