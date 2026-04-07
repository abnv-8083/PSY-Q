import { supabase } from '../lib/supabaseClient';

/**
 * Create a new purchase request
 * @param {string} userId - UUID of the user
 * @param {string} itemType - 'test' or 'bundle'
 * @param {string} itemId - UUID of the item
 * @param {string} requestNumber - 10-digit request number
 * @returns {Promise<Object>} The created purchase request
 */
export const createPurchaseRequest = async (userId, itemType, itemId, requestNumber) => {
    // Check if there's already a pending request for this item and user
    const { data: existing } = await supabase
        .from('purchase_requests')
        .select('*')
        .eq('user_id', userId)
        .eq('item_type', itemType)
        .eq('item_id', itemId)
        .eq('status', 'pending')
        .single();

    if (existing) {
        return existing;
    }

    const { data, error } = await supabase
        .from('purchase_requests')
        .insert({
            user_id: userId,
            item_type: itemType,
            item_id: itemId,
            request_number: requestNumber,
            status: 'pending'
        })
        .select()
        .single();

    if (error) throw error;
    return data;
};

/**
 * Fetch all purchase requests for a user
 * @param {string} userId - UUID of the user
 * @returns {Promise<Array>} Array of purchase requests
 */
export const fetchUserPurchaseRequests = async (userId) => {
    if (!userId) return [];
    
    const { data, error } = await supabase
        .from('purchase_requests')
        .select('*')
        .eq('user_id', userId);

    if (error) throw error;
    return data;
};

/**
 * Fetch all purchase requests (Admin only)
 * @returns {Promise<Array>} Array of purchase requests with profile data
 */
export const fetchAllPurchaseRequests = async () => {
    const backendUrl = import.meta.env.VITE_API_URL || '';
    try {
        const response = await fetch(`${backendUrl}/api/admin/purchase-requests`);
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
 * @param {string} requestId - UUID of the request
 * @param {string} status - 'approved' or 'rejected'
 * @returns {Promise<Object>} Updated purchase request
 */
export const updatePurchaseRequestStatus = async (requestId, status) => {
    const backendUrl = import.meta.env.VITE_API_URL || '';
    
    if (status === 'approved' || status === 'rejected') {
        const endpoint = status === 'approved' ? 'approve' : 'reject';
        const response = await fetch(`${backendUrl}/api/admin/purchase-requests/${requestId}/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        const json = await response.json();
        if (!response.ok || !json.success) throw new Error(json.message || `${status} failed`);
        return json.data;
    }

    // Fallback for other potential statuses (if any)
    const { data, error } = await supabase
        .from('purchase_requests')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', requestId)
        .select()
        .single();

    if (error) throw error;
    return data;
};
