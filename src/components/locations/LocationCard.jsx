import React from 'react';
import { Edit, Trash2, MapPin, Star, ExternalLink, DollarSign } from 'lucide-react';

const LocationCard = ({ location, onEdit, onDelete }) => {
  const getTypeColor = (type) => {
    const colors = {
      'Cultural and religious site': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'Historical landmark': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
      'Traditional shopping area': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Natural attraction': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
      'Adventure site': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'Beach destination': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
      'Mountain location': 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200',
      'Wildlife sanctuary': 'bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-200',
      'Archaeological site': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'Scenic viewpoint': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      'Waterfall': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'National park': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
      'Temple complex': 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200',
      'Colonial architecture': 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200',
      'Local market': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    };
    return colors[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300 dark:text-gray-600'
        }`}
      />
    ));
  };

  const formatEnteringFee = (enteringFee) => {
    if (enteringFee.isFree) {
      return 'Free';
    }
    return `${enteringFee.currency} ${enteringFee.amount}`;
  };

  return (
    <div className="card overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Image */}
      <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
        {location.images && location.images.length > 0 ? (
          <img
            src={location.images[0].url}
            alt={location.images[0].alt || location.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MapPin className="w-12 h-12 text-gray-400" />
          </div>
        )}
        
        {/* Type Badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(location.locationType)}`}>
            {location.locationType}
          </span>
        </div>

        {/* Actions */}
        <div className="absolute top-3 right-3 flex space-x-2">
          <button
            onClick={onEdit}
            className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:shadow-lg transition-shadow"
            title="Edit Location"
          >
            <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:shadow-lg transition-shadow"
            title="Delete Location"
          >
            <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Header */}
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">
            {location.name}
          </h3>
          
          {/* Rating */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              {renderStars(location.averageRating)}
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {location.averageRating.toFixed(1)} ({location.totalReviews} reviews)
            </span>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-3">
          <MapPin className="w-4 h-4 mr-1" />
          <span>{location.district}, {location.province}</span>
        </div>

        {/* Main Destination */}
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-3">
          <span className="font-medium">Main Destination:</span>
          <span className="ml-1">{location.mainDestination?.name || 'N/A'}</span>
        </div>

        {/* Distance */}
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-3">
          <span>{location.distanceFromColombo} km from Colombo</span>
        </div>

        {/* Entering Fee */}
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-3">
          <DollarSign className="w-4 h-4 mr-1" />
          <span className={`font-medium ${location.enteringFee.isFree ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`}>
            {formatEnteringFee(location.enteringFee)}
          </span>
        </div>

        {/* Climate */}
        <div className="mb-4">
          <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs rounded-full">
            {location.climate}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
          {location.description}
        </p>

        {/* Recommended Visit Time */}
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          <span className="font-medium">Best time to visit:</span>
          <span className="ml-1">{location.recommendedToVisit}</span>
        </div>

        {/* Facilities */}
        {location.facilities && location.facilities.length > 0 && (
          <div className="mb-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Facilities:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {location.facilities.slice(0, 3).map((facility, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded"
                >
                  {facility}
                </span>
              ))}
              {location.facilities.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded">
                  +{location.facilities.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Created {new Date(location.createdAt).toLocaleDateString()}
          </div>
          
          {location.mapUrl && (
            <a
              href={location.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              View Map
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationCard;
