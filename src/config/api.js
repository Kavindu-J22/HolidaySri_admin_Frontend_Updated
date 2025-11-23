import axios from "axios";

const API_BASE_URL = "https://holidaysri-backend-9xm4.onrender.com/api";

export { API_BASE_URL };

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Admin API calls
export const adminAPI = {
  login: (username, password) =>
    api.post("/admin/login", { username, password }),
  getDashboard: () => api.get("/admin/dashboard"),
  getHSCConfig: () => api.get("/admin/hsc-config"),
  updateHSCConfig: (configData) => api.put("/admin/hsc-config", configData),
  getUsers: (params) => api.get("/admin/users", { params }),
  getUserDetails: (userId) => api.get(`/admin/users/${userId}`),
  updateUserStatus: (userId, isActive) =>
    api.put(`/admin/users/${userId}/status`, { isActive }),
  getHSCPackages: () => api.get("/admin/hsc-packages"),
  createHSCPackage: (packageData) =>
    api.post("/admin/hsc-packages", packageData),
  updateHSCPackage: (packageId, packageData) =>
    api.put(`/admin/hsc-packages/${packageId}`, packageData),
  deleteHSCPackage: (packageId) =>
    api.delete(`/admin/hsc-packages/${packageId}`),
  getPromoCodeConfig: () => api.get("/promocodes/admin/config"),
  updatePromoCodeConfig: (configData) =>
    api.put("/promocodes/admin/config", configData),
  getPromoCodeTransactions: (params) =>
    api.get("/promocodes/admin/transactions", { params }),
  getClaimRequests: (params) => api.get("/admin/claim-requests", { params }),
  approveClaimRequest: (requestId, adminNote) =>
    api.post(`/admin/claim-requests/${requestId}/approve`, { adminNote }),
  getClaimRequestStats: () => api.get("/admin/claim-requests/stats"),
  getHSCEarnedClaims: (params) =>
    api.get("/admin/hsc-earned-claims", { params }),
  approveHSCEarnedClaim: (requestId, adminNote) =>
    api.post(`/admin/hsc-earned-claims/${requestId}/approve`, { adminNote }),
  getHSCEarnedClaimStats: () => api.get("/admin/hsc-earned-claims/stats"),

  // HSC Earned Records management
  getAllHSCEarnedRecords: (params) => api.get("/admin/hsc-earned-records", { params }),

  // Earnings management
  getAllEarnings: (params) => api.get("/admin/earnings", { params }),

  // Photo Earnings management
  getPhotoEarnings: (params) => api.get("/admin/photo-earnings", { params }),

  // HSC Transactions management
  getHSCTransactions: (params) => api.get("/admin/hsc-transactions", { params }),

  // Membership endpoints
  getMembershipTest: () => api.get("/admin/membership-test"),
  getMembershipConfig: () => api.get("/admin/membership-config"),
  updateMembershipConfig: (configData) =>
    api.put("/admin/membership-config", configData),
  getMembershipStats: () => api.get("/admin/membership-stats"),
  getMembershipTransactions: (params) =>
    api.get("/admin/membership-transactions", { params }),

  // Commercial Partner endpoints
  getCommercialPartnerConfig: () => api.get("/admin/commercial-partner-config"),
  updateCommercialPartnerConfig: (configData) =>
    api.put("/admin/commercial-partner-config", configData),
  getCommercialPartnerStats: () => api.get("/admin/commercial-partner-stats"),
  getCommercialPartners: (params) =>
    api.get("/admin/commercial-partners", { params }),

  // Advertisement Slot Charges Management
  getAdvertisementSlotCharges: () =>
    api.get("/admin/advertisement-slot-charges"),
  updateAdvertisementSlotCharges: (configData) =>
    api.put("/admin/advertisement-slot-charges", configData),
  getAdvertisementSlotChargesStats: () =>
    api.get("/admin/advertisement-slot-charges-stats"),
  getSpecificSlotCharges: (category, slot) =>
    api.get(
      `/admin/advertisement-slot-charges/${category}${slot ? `/${slot}` : ""}`
    ),

  // Newsletter management
  getNewsletterSubscribers: (params) =>
    api.get("/newsletter/subscribers", { params }),
  getNewsletterStats: () => api.get("/newsletter/stats"),
  updateSubscriberStatus: (subscriberId, status) =>
    api.put(`/newsletter/subscribers/${subscriberId}/status`, { status }),
  deleteSubscriber: (subscriberId) =>
    api.delete(`/newsletter/subscribers/${subscriberId}`),
  sendNewsletter: (data) => api.post("/newsletter/send-newsletter", data),

  // Token Distribution
  getUsersForDistribution: (params) =>
    api.get("/admin/users-for-distribution", { params }),
  distributeTokens: (distributionData) =>
    api.post("/admin/distribute-tokens", distributionData),
  getDistributionHistory: (params) =>
    api.get("/admin/distribution-history", { params }),
  getDistributionDetails: (id) => api.get(`/admin/distribution-history/${id}`),

  // Customize Tour Package
  getCustomizeTourPackageRequests: (params) =>
    api.get("/customize-tour-package/admin/requests", { params }),
  getCustomizeTourPackageStats: () =>
    api.get("/customize-tour-package/admin/stats"),
  updateCustomizeTourPackageStatus: (requestId, data) =>
    api.put(`/customize-tour-package/admin/request/${requestId}/status`, data),
  getCustomizeTourPackageDetails: (requestId) =>
    api.get(`/customize-tour-package/admin/request/${requestId}`),

  // Customize Event Request
  getCustomizeEventRequests: (params) =>
    api.get("/customize-event-request/admin/requests", { params }),
  getCustomizeEventStats: () => api.get("/customize-event-request/admin/stats"),
  updateCustomizeEventStatus: (requestId, data) =>
    api.put(`/customize-event-request/admin/request/${requestId}/status`, data),
  getCustomizeEventDetails: (requestId) =>
    api.get(`/customize-event-request/admin/request/${requestId}`),
  showEventToPartners: (requestId, data) =>
    api.put(
      `/customize-event-request/admin/request/${requestId}/show-partners`,
      data
    ),

  // Agents Management
  getAgents: (params) => api.get("/admin/agents", { params }),
  getAgentDetails: (agentId) => api.get(`/admin/agents/${agentId}`),
  updateAgentStatus: (agentId, isActive) =>
    api.put(`/admin/agents/${agentId}/status`, { isActive }),

  // Payment Activities Management
  getPaymentActivities: (params) => api.get("/admin/payment-activities", { params }),
  getPaymentActivityDetails: (activityId) => api.get(`/admin/payment-activities/${activityId}`),

  // Room Bookings Management
  getRoomBookings: (params) => api.get("/admin/room-bookings", { params }),
  getRoomBookingDetails: (bookingId) => api.get(`/admin/room-bookings/${bookingId}`),

  // Advertisements Management
  getAdvertisements: (params) => api.get("/admin/advertisements", { params }),
  getAdvertisementDetails: (adId) => api.get(`/admin/advertisements/${adId}`),
  toggleAdvertisementActive: (adId) => api.put(`/admin/advertisements/${adId}/toggle-active`),
  deleteAdvertisement: (adId, slotId, adminNote) =>
    api.delete(`/admin/advertisements/${adId}`, { data: { slotId, adminNote } }),

  // Company Finance Management
  getFinancialSummary: (params) => api.get("/company-finance/summary", { params }),
  getEarnings: (params) => api.get("/company-finance/earnings", { params }),
  getExpenses: (params) => api.get("/company-finance/expenses", { params }),
  createExpense: (data) => api.post("/company-finance/expenses", data),
  updateExpense: (id, data) => api.put(`/company-finance/expenses/${id}`, data),
  deleteExpense: (id) => api.delete(`/company-finance/expenses/${id}`),
  getExpenseDetails: (id) => api.get(`/company-finance/expenses/${id}`),

  // Holiday Memories (Photos from Travelers) Management
  getHolidayMemories: (params) => api.get("/admin/holiday-memories", { params }),
  getHolidayMemoryDetails: (photoId) => api.get(`/admin/holiday-memories/${photoId}`),
  updateHolidayMemory: (photoId, data) => api.put(`/admin/holiday-memories/${photoId}`, data),
  deleteHolidayMemory: (photoId, data) => api.delete(`/admin/holiday-memories/${photoId}`, { data }),
  deleteHolidayMemoryComment: (photoId, commentId) =>
    api.delete(`/admin/holiday-memories/${photoId}/comments/${commentId}`),

  // Database Backup Management
  getBackupStatus: () => api.get("/admin/database-backup/status"),
  triggerManualBackup: () => api.post("/admin/database-backup/trigger"),
  restoreFromBackup: (confirmRestore) =>
    api.post("/admin/database-backup/restore", { confirmRestore }),
};

export default api;
