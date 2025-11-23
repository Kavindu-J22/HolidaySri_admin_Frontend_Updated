import React, { useState, useEffect } from 'react';
import {
  Database,
  RefreshCw,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  Clock,
  HardDrive,
  Calendar,
  FileText,
  Activity,
  Loader,
  RotateCcw,
  Shield
} from 'lucide-react';
import { adminAPI } from '../config/api';

const DatabaseBackup = () => {
  const [backupStatus, setBackupStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchBackupStatus();
  }, []);

  const fetchBackupStatus = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getBackupStatus();
      setBackupStatus(response.data);
    } catch (error) {
      console.error('Error fetching backup status:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to fetch backup status'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManualBackup = async () => {
    try {
      setActionLoading(true);
      setMessage({ type: '', text: '' });
      
      const response = await adminAPI.triggerManualBackup();
      
      setMessage({
        type: 'success',
        text: 'Backup completed successfully!'
      });
      
      // Refresh backup status
      await fetchBackupStatus();
    } catch (error) {
      console.error('Error triggering backup:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to trigger backup'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestore = async () => {
    try {
      setActionLoading(true);
      setMessage({ type: '', text: '' });
      
      const response = await adminAPI.restoreFromBackup(true);
      
      setMessage({
        type: 'success',
        text: `Database restored successfully! ${response.data.restore.documents} documents restored.`
      });
      
      setShowRestoreConfirm(false);
      
      // Refresh backup status
      await fetchBackupStatus();
    } catch (error) {
      console.error('Error restoring backup:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to restore backup'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Asia/Colombo'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-admin-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <Database className="w-8 h-8 mr-3 text-admin-600" />
              Database Backup
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage database backups and restore operations
            </p>
          </div>
          <button
            onClick={fetchBackupStatus}
            disabled={loading}
            className="btn-secondary flex items-center"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Message Alert */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-lg flex items-start ${
          message.type === 'success'
            ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
            : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1">{message.text}</div>
        </div>
      )}

      {/* No Backup State */}
      {!backupStatus?.hasBackup && (
        <div className="card p-8 text-center">
          <Database className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Backups Available
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {backupStatus?.message || 'Backups will be created automatically at 2:00 AM daily.'}
          </p>
          <button
            onClick={handleManualBackup}
            disabled={actionLoading}
            className="btn-primary flex items-center mx-auto"
          >
            {actionLoading ? (
              <Loader className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Create Backup Now
          </button>
        </div>
      )}

      {/* Backup Details */}
      {backupStatus?.hasBackup && (
        <div className="space-y-6">
          {/* Status Card */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <CheckCircle className="w-6 h-6 mr-2 text-green-500" />
                Last Backup Status
              </h2>
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
                Active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* File Name */}
              <div className="flex items-start space-x-3">
                <FileText className="w-5 h-5 text-admin-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">File Name</p>
                  <p className="font-medium text-gray-900 dark:text-white break-all">
                    {backupStatus.backup.fileName}
                  </p>
                </div>
              </div>

              {/* Database */}
              <div className="flex items-start space-x-3">
                <Database className="w-5 h-5 text-admin-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Database</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {backupStatus.backup.database}
                  </p>
                </div>
              </div>

              {/* Timestamp */}
              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-admin-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Backup Date</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatDate(backupStatus.backup.timestamp)}
                  </p>
                </div>
              </div>

              {/* Compressed Size */}
              <div className="flex items-start space-x-3">
                <HardDrive className="w-5 h-5 text-admin-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Compressed Size</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {backupStatus.backup.compressedSize}
                  </p>
                </div>
              </div>

              {/* Total Backups */}
              <div className="flex items-start space-x-3">
                <Activity className="w-5 h-5 text-admin-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Backups</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {backupStatus.backup.totalBackups} backups
                  </p>
                </div>
              </div>

              {/* Backup Method */}
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-admin-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Backup Method</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {backupStatus.backup.backupMethod}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Backup Configuration */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Backup Configuration
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <Clock className="w-5 h-5 text-admin-600 mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Schedule</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {backupStatus.backup.schedule}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <HardDrive className="w-5 h-5 text-admin-600 mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Location</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {backupStatus.backup.backupLocation}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <Activity className="w-5 h-5 text-admin-600 mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Retention</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {backupStatus.backup.retention}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Backup Actions
            </h2>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={handleManualBackup}
                disabled={actionLoading}
                className="btn-primary flex items-center"
              >
                {actionLoading ? (
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Create Backup Now
              </button>

              <button
                onClick={() => setShowRestoreConfirm(true)}
                disabled={actionLoading}
                className="btn-danger flex items-center"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Restore Last Backup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restore Confirmation Modal */}
      {showRestoreConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <div className="flex items-start mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500 mr-3 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Confirm Database Restore
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  This action will <strong>DELETE ALL EXISTING DATA</strong> and restore from the last backup.
                  This cannot be undone!
                </p>
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                ⚠️ Warning: All current data will be permanently deleted!
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowRestoreConfirm(false)}
                disabled={actionLoading}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleRestore}
                disabled={actionLoading}
                className="btn-danger flex items-center"
              >
                {actionLoading ? (
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RotateCcw className="w-4 h-4 mr-2" />
                )}
                Yes, Restore Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseBackup;

