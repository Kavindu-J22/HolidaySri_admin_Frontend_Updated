import { useState } from 'react';
import {
  X,
  MapPin,
  Calendar,
  User,
  Mail,
  Heart,
  MessageSquare,
  Download,
  Eye,
  Tag,
  ExternalLink,
  CheckCircle,
  XCircle,
  Trash2,
  AlertTriangle,
  Flag
} from 'lucide-react';
import { adminAPI } from '../../config/api';

const ViewPhotoModal = ({ photo, onClose, onUpdate }) => {
  const [deletingCommentId, setDeletingCommentId] = useState(null);
  const [localPhoto, setLocalPhoto] = useState(photo);
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    setDeletingCommentId(commentId);
    try {
      await adminAPI.deleteHolidayMemoryComment(localPhoto._id, commentId);

      // Update local state
      setLocalPhoto(prev => ({
        ...prev,
        comments: prev.comments.filter(c => c._id !== commentId)
      }));

      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert(error.response?.data?.message || 'Failed to delete comment');
    } finally {
      setDeletingCommentId(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Photo Details
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Image */}
            <div>
              <div className="relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                <img
                  src={localPhoto.image}
                  alt={localPhoto.caption}
                  className="w-full h-auto"
                />
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  {localPhoto.isActive ? (
                    <span className="px-3 py-1.5 bg-green-500 text-white text-sm font-medium rounded-full flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Active
                    </span>
                  ) : (
                    <span className="px-3 py-1.5 bg-red-500 text-white text-sm font-medium rounded-full flex items-center gap-2">
                      <XCircle className="w-4 h-4" />
                      Inactive
                    </span>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-4 mt-4">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Heart className="w-5 h-5 text-red-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{localPhoto.likes?.length || 0}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Likes</p>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <MessageSquare className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{localPhoto.comments?.length || 0}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Comments</p>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Download className="w-5 h-5 text-green-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{localPhoto.downloads?.length || 0}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Downloads</p>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Eye className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{localPhoto.viewCount || 0}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Views</p>
                </div>
              </div>

              {/* Reports Alert */}
              {localPhoto.reports && localPhoto.reports.length > 0 && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    <div>
                      <p className="text-sm font-semibold text-red-900 dark:text-red-200">
                        {localPhoto.reports.length} Report{localPhoto.reports.length > 1 ? 's' : ''}
                      </p>
                      <p className="text-xs text-red-700 dark:text-red-300">
                        This post has been flagged by users
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Details */}
            <div className="space-y-6">
              {/* User Info */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">User Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-900 dark:text-white">{localPhoto.userName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-900 dark:text-white">{localPhoto.userEmail}</span>
                  </div>
                </div>
              </div>

              {/* Caption */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Caption</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                  {localPhoto.caption}
                </p>
              </div>

              {/* Location */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Location</h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-gray-900 dark:text-white font-medium">{localPhoto.location?.name}</p>
                      {localPhoto.location?.city && (
                        <p className="text-gray-600 dark:text-gray-400">City: {localPhoto.location.city}</p>
                      )}
                      {localPhoto.location?.province && (
                        <p className="text-gray-600 dark:text-gray-400">Province: {localPhoto.location.province}</p>
                      )}
                    </div>
                  </div>
                  {localPhoto.mapLink && (
                    <a
                      href={localPhoto.mapLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View on Map
                    </a>
                  )}
                </div>
              </div>

              {/* Tags */}
              {localPhoto.tags && localPhoto.tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {localPhoto.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm rounded-full flex items-center gap-1"
                      >
                        <Tag className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Dates */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Dates</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-400">Created:</span>
                    <span className="text-gray-900 dark:text-white">{formatDate(localPhoto.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-400">Updated:</span>
                    <span className="text-gray-900 dark:text-white">{formatDate(localPhoto.updatedAt)}</span>
                  </div>
                </div>
              </div>

              {/* Download Price */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Download Price</h3>
                <p className="text-gray-900 dark:text-white text-sm">
                  {localPhoto.downloadPrice || 2.5} HSC
                </p>
              </div>

              {/* Total Earnings */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Total Earnings</h3>
                <p className="text-gray-900 dark:text-white text-sm font-medium">
                  {localPhoto.totalEarnings || 0} HSC
                </p>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          {localPhoto.comments && localPhoto.comments.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Comments ({localPhoto.comments.length})
              </h3>
              <div className="space-y-4 max-h-60 overflow-y-auto">
                {localPhoto.comments.map((comment) => (
                  <div
                    key={comment._id}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
                  >
                    <div className="flex items-start gap-3">
                      {comment.userAvatar ? (
                        <img
                          src={comment.userAvatar}
                          alt={comment.userName}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900 dark:text-white text-sm">
                            {comment.userName}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 text-sm">
                          {comment.text}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteComment(comment._id)}
                        disabled={deletingCommentId === comment._id}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete comment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reports Section */}
          {localPhoto.reports && localPhoto.reports.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <h3 className="text-lg font-semibold text-red-900 dark:text-red-200">
                  Reports ({localPhoto.reports.length})
                </h3>
              </div>
              <div className="space-y-4 max-h-60 overflow-y-auto">
                {localPhoto.reports.map((report, index) => (
                  <div
                    key={report._id || index}
                    className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-lg">
                        <Flag className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-red-900 dark:text-red-200 text-sm">
                            {report.userName || 'Anonymous'}
                          </span>
                          {report.createdAt && (
                            <span className="text-xs text-red-700 dark:text-red-300">
                              {formatDate(report.createdAt)}
                            </span>
                          )}
                        </div>
                        {report.reason && (
                          <div className="mb-2">
                            <span className="text-xs font-semibold text-red-800 dark:text-red-300">Reason: </span>
                            <span className="text-xs text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/40 px-2 py-0.5 rounded">
                              {report.reason}
                            </span>
                          </div>
                        )}
                        {report.description && (
                          <p className="text-red-800 dark:text-red-200 text-sm">
                            {report.description}
                          </p>
                        )}
                        {report.userEmail && (
                          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                            Email: {report.userEmail}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-xs text-yellow-800 dark:text-yellow-200">
                  <strong>Note:</strong> This post has been reported {localPhoto.reports.length} time{localPhoto.reports.length > 1 ? 's' : ''}. Please review the content and take appropriate action if necessary.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewPhotoModal;
