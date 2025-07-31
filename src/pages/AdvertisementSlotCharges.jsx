import React, { useState, useEffect } from 'react';
import { adminAPI } from '../config/api';
import { 
  DollarSign, 
  Save, 
  RefreshCw, 
  TrendingUp, 
  Calendar,
  Clock,
  Settings,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';

const AdvertisementSlotCharges = () => {
  const [config, setConfig] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('homeBanner');

  // Category definitions with display names
  const categories = {
    homeBanner: {
      name: 'Home Banner',
      description: 'Premium home page banner advertisement slot',
      hasHourly: true
    },
    tourismTravel: {
      name: 'Tourism & Travel',
      description: 'Travel buddies, tour guides, packages, and travel services',
      slots: {
        travelBuddys: 'Travel Buddys',
        tourGuiders: 'Tour Guiders',
        localTourPackages: 'Local Tour Packages',
        customizeTourPackage: 'Customize Tour Package',
        travelSafeHelpProfessionals: 'TravelSafe & Help Professionals',
        rentLandCampingParking: 'Rent a Land for Camping or Parking'
      }
    },
    accommodationDining: {
      name: 'Accommodation & Dining',
      description: 'Hotels, restaurants, cafes, and food services',
      slots: {
        hotelsAccommodations: 'Hotels & Accommodations',
        cafesRestaurants: 'Cafes & Restaurants',
        foodsBeverages: 'Foods & Beverages'
      }
    },
    vehiclesTransport: {
      name: 'Vehicles & Transport',
      description: 'Vehicle rentals, rides, drivers, and transport services',
      slots: {
        vehicleRentalsHire: 'Vehicle Rentals & Hire Services',
        liveRidesCarpooling: 'Live Rides Updates & Carpooling',
        professionalDrivers: 'Professional Drivers',
        vehicleRepairsMechanics: 'Vehicle Repairs & Mechanics'
      }
    },
    eventsManagement: {
      name: 'Events & Management',
      description: 'Event planning, photography, decoration, and related services',
      slots: {
        eventsUpdates: 'Events Updates',
        eventPlannersCoordinators: 'Expert Event Planners & Day Coordinators',
        creativePhotographers: 'Creative Photographers',
        decoratorsFlorists: 'Decorators & Florists',
        salonMakeupArtists: 'Salon & Makeup Artists',
        fashionDesigners: 'Fashion Designers'
      }
    },
    professionalsServices: {
      name: 'Professionals & Services',
      description: 'Professional services including doctors, lawyers, and consultants',
      slots: {
        expertDoctors: 'Expert Doctors',
        professionalLawyers: 'Professional Lawyers',
        advisorsCounselors: 'Experienced Advisors & Counselors',
        languageTranslators: 'Language Translators & Interpreters',
        expertArchitects: 'Expert Architects',
        trustedAstrologists: 'Trusted Astrologists',
        deliveryPartners: 'Delivery Partners',
        graphicsItTechRepair: 'Graphics/IT Supports & Tech Repair Services',
        educationalTutoring: 'Educational & Tutoring Services',
        currencyExchange: 'Currency Exchange Rates & Services',
        otherProfessionalsServices: 'Other Professionals & Services'
      }
    },
    caringDonations: {
      name: 'Caring & Donations',
      description: 'Caregiving, childcare, pet care, and donation services',
      slots: {
        caregiversTimeCurrency: 'Compassionate Caregivers & Earn Time Currency',
        babysittersChildcare: 'Trusted Babysitters & Childcare Help',
        petCareAnimalServices: 'Pet Care & Animal Services',
        donationsRaiseFund: 'Donations / Raise Your Fund'
      }
    },
    marketplaceShopping: {
      name: 'Marketplace & Shopping',
      description: 'E-commerce, retail, and marketplace services',
      slots: {
        rentPropertyBuyingSelling: 'Rent & Property Buying & Selling Platform',
        exclusiveGiftPacks: 'Exclusive Gift Packs',
        souvenirsCollectibles: 'Souvenirs & Collectibles',
        jewelryGemSellers: 'Jewelry & Gem Sellers',
        homeOfficeAccessoriesTech: 'Home/Office Accessories & Tech Gadgets',
        fashionBeautyClothing: 'Fashion/Beauty & Clothing Items',
        dailyGroceryEssentials: 'Daily Grocery Essentials',
        organicHerbalProductsSpices: 'Organic Herbal Products & Spices',
        booksMagazinesEducational: 'Books, Magazines & Educational Materials',
        otherItems: 'Other Items',
        createLinkOwnStore: 'Create or Link Your Own Store'
      }
    },
    entertainmentFitness: {
      name: 'Entertainment & Fitness',
      description: 'Entertainment, fitness, health, and wellness services',
      slots: {
        exclusiveComboPackages: 'Exclusive Combo Packages (Wedding, Tour and More)',
        talentedEntertainersArtists: 'Talented Entertainers & Artists',
        fitnessHealthSpasGym: 'Fitness & Health: Spas, Gym Etc. & Professionals',
        cinemaMovieHub: 'Cinema & Movie Hub',
        socialMediaPromotions: 'Social Media Promotions'
      }
    },
    specialOpportunities: {
      name: 'Special Opportunities',
      description: 'Job opportunities, crypto, promotions, and special offers',
      slots: {
        jobOpportunities: 'Exciting Job Opportunities',
        cryptoConsultingSignals: 'Crypto Consulting & Signals',
        localSimMobileData: 'Local SIM Cards & Mobile Data Plans',
        customAdsCampaigns: 'Custom Ads Campaigns',
        exclusiveOffersPromotions: 'Exclusive Offers & Promotions'
      }
    },
    essentialServices: {
      name: 'Essential Services',
      description: 'Emergency services, insurance, and essential utilities',
      slots: {
        emergencyServicesInsurance: 'Emergency Services & Insurance'
      }
    }
  };

  useEffect(() => {
    fetchConfig();
    fetchStats();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAdvertisementSlotCharges();
      setConfig(response.data.config);
    } catch (error) {
      console.error('Error fetching advertisement slot charges config:', error);
      setMessage({ 
        type: 'error', 
        text: 'Failed to load advertisement slot charges configuration' 
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await adminAPI.getAdvertisementSlotChargesStats();
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching advertisement slot charges stats:', error);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await adminAPI.updateAdvertisementSlotCharges(config);
      setMessage({ 
        type: 'success', 
        text: 'Advertisement slot charges updated successfully!' 
      });
      fetchStats(); // Refresh stats after update
    } catch (error) {
      console.error('Error updating advertisement slot charges:', error);
      setMessage({ 
        type: 'error', 
        text: 'Failed to update advertisement slot charges' 
      });
    } finally {
      setSaving(false);
    }
  };

  const updateCharges = (category, slot, period, value) => {
    const numValue = parseFloat(value) || 0;
    setConfig(prev => {
      const newConfig = { ...prev };
      if (category === 'homeBanner') {
        newConfig.homeBanner = {
          ...newConfig.homeBanner,
          [period]: numValue
        };
      } else {
        if (!newConfig[category]) newConfig[category] = {};
        if (!newConfig[category][slot]) newConfig[category][slot] = {};
        newConfig[category][slot] = {
          ...newConfig[category][slot],
          [period]: numValue
        };
      }
      return newConfig;
    });
  };

  const renderHomeBannerSection = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-lg">
        <div className="flex items-center space-x-3">
          <TrendingUp className="w-8 h-8" />
          <div>
            <h3 className="text-xl font-bold">Home Banner Advertisement Slot</h3>
            <p className="text-purple-100">Premium placement on the home page with maximum visibility</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Hourly Charge */}
        <div className="card p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Clock className="w-5 h-5 text-purple-600" />
            <label className="font-medium text-gray-700 dark:text-gray-300">
              Hourly Charge
            </label>
          </div>
          <div className="relative">
            <input
              type="number"
              value={config?.homeBanner?.hourlyCharge || 0}
              onChange={(e) => updateCharges('homeBanner', null, 'hourlyCharge', e.target.value)}
              className="input-field pl-12"
              placeholder="0"
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              LKR
            </span>
          </div>
        </div>

        {/* Daily Charge */}
        <div className="card p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Calendar className="w-5 h-5 text-blue-600" />
            <label className="font-medium text-gray-700 dark:text-gray-300">
              Daily Charge
            </label>
          </div>
          <div className="relative">
            <input
              type="number"
              value={config?.homeBanner?.dailyCharge || 0}
              onChange={(e) => updateCharges('homeBanner', null, 'dailyCharge', e.target.value)}
              className="input-field pl-12"
              placeholder="0"
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              LKR
            </span>
          </div>
        </div>

        {/* Monthly Charge */}
        <div className="card p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Calendar className="w-5 h-5 text-green-600" />
            <label className="font-medium text-gray-700 dark:text-gray-300">
              Monthly Charge
            </label>
          </div>
          <div className="relative">
            <input
              type="number"
              value={config?.homeBanner?.monthlyCharge || 0}
              onChange={(e) => updateCharges('homeBanner', null, 'monthlyCharge', e.target.value)}
              className="input-field pl-12"
              placeholder="0"
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              LKR
            </span>
          </div>
        </div>

        {/* Yearly Charge */}
        <div className="card p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Calendar className="w-5 h-5 text-orange-600" />
            <label className="font-medium text-gray-700 dark:text-gray-300">
              Yearly Charge
            </label>
          </div>
          <div className="relative">
            <input
              type="number"
              value={config?.homeBanner?.yearlyCharge || 0}
              onChange={(e) => updateCharges('homeBanner', null, 'yearlyCharge', e.target.value)}
              className="input-field pl-12"
              placeholder="0"
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              LKR
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCategorySection = (categoryKey) => {
    const category = categories[categoryKey];
    if (!category || !category.slots) return null;

    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-lg">
          <div className="flex items-center space-x-3">
            <Settings className="w-8 h-8" />
            <div>
              <h3 className="text-xl font-bold">{category.name}</h3>
              <p className="text-blue-100">{category.description}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {Object.entries(category.slots).map(([slotKey, slotName]) => (
            <div key={slotKey} className="card p-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {slotName}
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Daily Charge */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Daily Charge (LKR)
                  </label>
                  <input
                    type="number"
                    value={config?.[categoryKey]?.[slotKey]?.dailyCharge || 0}
                    onChange={(e) => updateCharges(categoryKey, slotKey, 'dailyCharge', e.target.value)}
                    className="input-field"
                    placeholder="0"
                  />
                </div>

                {/* Monthly Charge */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Monthly Charge (LKR)
                  </label>
                  <input
                    type="number"
                    value={config?.[categoryKey]?.[slotKey]?.monthlyCharge || 0}
                    onChange={(e) => updateCharges(categoryKey, slotKey, 'monthlyCharge', e.target.value)}
                    className="input-field"
                    placeholder="0"
                  />
                </div>

                {/* Yearly Charge */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Yearly Charge (LKR)
                  </label>
                  <input
                    type="number"
                    value={config?.[categoryKey]?.[slotKey]?.yearlyCharge || 0}
                    onChange={(e) => updateCharges(categoryKey, slotKey, 'yearlyCharge', e.target.value)}
                    className="input-field"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex items-center space-x-3">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600 dark:text-gray-400">Loading advertisement slot charges...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Advertisement Slot Charges
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage pricing for all advertisement slots across different categories
          </p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={fetchConfig}
            disabled={loading}
            className="btn-secondary flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          
          <button
            onClick={handleSave}
            disabled={saving || !config}
            className="btn-primary flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
          <div className="flex items-center space-x-2">
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{message.text}</span>
          </div>
        </div>
      )}

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Settings className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Slots</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalSlots}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Categories</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalCategories}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Currency</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.currency}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Info className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Last Updated</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {stats.lastUpdated ? new Date(stats.lastUpdated).toLocaleDateString() : 'Never'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {Object.entries(categories).map(([key, category]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === key
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {category.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'homeBanner' && renderHomeBannerSection()}
        {activeTab !== 'homeBanner' && renderCategorySection(activeTab)}
      </div>
    </div>
  );
};

export default AdvertisementSlotCharges;
