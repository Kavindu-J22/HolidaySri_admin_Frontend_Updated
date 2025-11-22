import { useState } from 'react';
import {
  X,
  Trash2,
  Loader,
  AlertTriangle,
  MessageSquare
} from 'lucide-react';
import { adminAPI } from '../../config/api';

const DeletePhotoModal = ({ photo, onClose, onDelete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [deleteComments, setDeleteComments] = useState(false);

  const handleDelete = async () => {
    if (!adminNote.trim()) {
      setError('Admin note is required to notify the user');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await adminAPI.deleteHolidayMemory(photo._id, {
        adminNote: adminNote.trim(),
        deleteComments
      });
      onDelete();
      onClose();
    } catch (error) {
      console.error('Error deleting photo:', error);
      setError(error.response?.data?.message || 'Failed to delete photo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full">
        {/* Header */}
        <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 px-6 py-4 flex items-center justify-between rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-red-900 dark:text-red-200">
              Delete Photo
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-red-900 dark:text-red-200" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Warning */}
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-yellow-800 dark:text-yellow-200 text-sm">
              <strong>Warning:</strong> This action cannot be undone. The photo and all associated data will be permanently deleted.
            </p>
          </div>

          {/* Photo Preview */}
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex gap-4">
              <img
                src={photo.image}
                alt={photo.caption}
                className="w-24 h-24 object-cover rounded-lg"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white mb-1 line-clamp-2">
                  {photo.caption}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  By: {photo.userName}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Email: {photo.userEmail}
                </p>
              </div>
            </div>
          </div>

          {/* Admin Note */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Admin Note (Required) *
            </label>
            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              rows="4"
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Explain why this photo is being deleted. This will be sent to the user via email."
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              This note will be included in the email notification sent to the user.
            </p>
          </div>

          {/* Delete Comments Option */}
          {photo.comments && photo.comments.length > 0 && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="deleteComments"
                  checked={deleteComments}
                  onChange={(e) => setDeleteComments(e.target.checked)}
                  className="mt-1 w-4 h-4 text-red-600 rounded focus:ring-2 focus:ring-red-500"
                />
                <label htmlFor="deleteComments" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white mb-1">
                    <MessageSquare className="w-4 h-4" />
                    Delete all comments ({photo.comments.length})
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    This will permanently delete all {photo.comments.length} comment(s) associated with this photo.
                  </p>
                </label>
              </div>
            </div>
          )}

          {/* What will be deleted */}
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
              What will be deleted:
            </h4>
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 list-disc list-inside">
              <li>Photo and image data</li>
              <li>All likes ({photo.likes?.length || 0})</li>
              <li>All saves ({photo.saves?.length || 0})</li>
              <li>All download records ({photo.downloads?.length || 0})</li>
              {deleteComments && <li>All comments ({photo.comments?.length || 0})</li>}
              <li>Location and tag information</li>
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 rounded-b-lg flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading || !adminNote.trim()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Delete Photo & Notify User
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeletePhotoModal;

