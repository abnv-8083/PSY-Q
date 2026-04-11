import axios from 'axios';

/**
 * Create a new purchase request
 * @param {string} userId - MongoDB ID of the user
 * @param {string} itemType - 'test' or 'bundle'
 * @param {string} itemId - MongoDB ID of the item
 * @param {string} requestNumber - 10-digit request number
 * @returns {Promise<Object>} The created purchase request
 */
export const createPurchaseRequest = async (userId, itemType, itemId, requestNumber) => {
    const backendUrl = import.meta.env.VITE_API_URL || '';
    const res = await axios.post(`${backendUrl}/student/purchase-requests`, {
        userId,
        itemType,
        itemId,
        requestNumber
    });
    if (!res.data.success) throw new Error(res.data.message || 'Failed to create purchase request');
    return res.data.data;
};

/**
 * Fetch all purchase requests for a user
 * @param {string} userId - MongoDB ID of the user
 * @returns {Promise<Array>} Array of purchase requests
 */
export const fetchUserPurchaseRequests = async (userId) => {
    if (!userId) return [];
    
    try {
        const backendUrl = import.meta.env.VITE_API_URL || '';
        const res = await axios.get(`${backendUrl}/student/purchase-requests?userId=${userId}`);
        if (!res.data.success) throw new Error(res.data.message || 'Failed to fetch user requests');
        return res.data.data || [];
    } catch (error) {
        console.error('Error fetching user purchase requests:', error);
        return [];
    }
};

/**
 * Fetch all purchase requests (Admin only)
 * @returns {Promise<Array>} Array of purchase requests with profile data
 */
export const fetchAllPurchaseRequests = async () => {
    const backendUrl = import.meta.env.VITE_API_URL || '';
    try {
        const response = await fetch(`${backendUrl}/admin/purchase-requests`);
        const json = await response.json();
        
        if (!response.ok || !json.success) {
            throw new Error(json.message || 'Failed to fetch purchase requests');
        }
        
        return json.data;
    } catch (error) {
        console.error('Error fetching purchase requests via backend:', error);
        throw error;
    }
};

/**
 * Update purchase request status (Admin only)
 * @param {string} requestId - MongoDB ID of the request
 * @param {string} status - 'approved' or 'rejected'
 * @returns {Promise<Object>} Updated purchase request
 */
export const updatePurchaseRequestStatus = async (requestId, status) => {
    const backendUrl = import.meta.env.VITE_API_URL || '';
    
    const endpoint = status === 'approved' ? 'approve' : 'reject';
    const response = await fetch(`${backendUrl}/admin/purchase-requests/${requestId}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    });
    const json = await response.json();
    if (!response.ok || !json.success) throw new Error(json.message || `${status} failed`);
    return json.data;
};
