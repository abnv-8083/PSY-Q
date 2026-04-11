const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Fetch all active notifications ordered by display_order
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export const fetchNotifications = async () => {
    try {
        const response = await fetch(`${API_URL}/notifications?activeOnly=true`);
        const result = await response.json();
        if (!result.success) throw new Error(result.message);
        return { data: result.data, error: null };
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return { data: null, error };
    }
};

/**
 * Fetch all notifications (including inactive ones) for admin management
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export const fetchAllNotifications = async () => {
    try {
        const response = await fetch(`${API_URL}/notifications`);
        const result = await response.json();
        if (!result.success) throw new Error(result.message);
        return { data: result.data, error: null };
    } catch (error) {
        console.error('Error fetching all notifications:', error);
        return { data: null, error };
    }
};

/**
 * Create a new notification
 * @param {Object} notification - Notification data
 * @returns {Promise<{data: Object, error: Error|null}>}
 */
export const createNotification = async (notification) => {
    try {
        const response = await fetch(`${API_URL}/admin/notifications`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(notification)
        });
        const result = await response.json();
        if (!result.success) throw new Error(result.message);
        return { data: result.data, error: null };
    } catch (error) {
        console.error('Error creating notification:', error);
        return { data: null, error };
    }
};

/**
 * Update an existing notification
 * @param {string} id - Notification ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<{data: Object, error: Error|null}>}
 */
export const updateNotification = async (id, updates) => {
    try {
        const response = await fetch(`${API_URL}/admin/notifications/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });
        const result = await response.json();
        if (!result.success) throw new Error(result.message);
        return { data: result.data, error: null };
    } catch (error) {
        console.error('Error updating notification:', error);
        return { data: null, error };
    }
};

/**
 * Delete a notification
 * @param {string} id - Notification ID
 * @returns {Promise<{success: boolean, error: Error|null}>}
 */
export const deleteNotification = async (id) => {
    try {
        const response = await fetch(`${API_URL}/admin/notifications/${id}`, {
            method: 'DELETE'
        });
        const result = await response.json();
        if (!result.success) throw new Error(result.message);
        return { success: true, error: null };
    } catch (error) {
        console.error('Error deleting notification:', error);
        return { success: false, error };
    }
};

/**
 * Reorder notifications
 * @param {Array<{id: string, display_order: number}>} notifications - Array of notifications with new order
 * @returns {Promise<{success: boolean, error: Error|null}>}
 */
export const reorderNotifications = async (notifications) => {
    try {
        const response = await fetch(`${API_URL}/admin/notifications/reorder`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notifications })
        });
        const result = await response.json();
        if (!result.success) throw new Error(result.message);
        return { success: true, error: null };
    } catch (error) {
        console.error('Error reordering notifications:', error);
        return { success: false, error };
    }
};

/**
 * Toggle notification active status
 * @param {string} id - Notification ID
 * @param {boolean} isActive - New active status
 * @returns {Promise<{data: Object, error: Error|null}>}
 */
export const toggleNotificationStatus = async (id, isActive) => {
    return updateNotification(id, { is_active: isActive });
};
