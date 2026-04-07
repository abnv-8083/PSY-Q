import { supabase } from '../lib/supabaseClient';

/**
 * Fetch all active notifications ordered by display_order
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export const fetchNotifications = async () => {
    try {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('is_active', true)
            .order('display_order', { ascending: true });

        if (error) throw error;
        return { data, error: null };
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
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .order('display_order', { ascending: true });

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error fetching all notifications:', error);
        return { data: null, error };
    }
};

/**
 * Create a new notification
 * @param {Object} notification - Notification data
 * @param {string} notification.image_url - URL to the image
 * @param {string} notification.header - Header text
 * @param {string} notification.description - Description text
 * @param {boolean} notification.is_active - Whether the notification is active
 * @param {number} notification.display_order - Display order
 * @returns {Promise<{data: Object, error: Error|null}>}
 */
export const createNotification = async (notification) => {
    try {
        const { data, error } = await supabase
            .from('notifications')
            .insert([{
                image_url: notification.image_url,
                header: notification.header,
                description: notification.description,
                is_active: notification.is_active ?? true,
                display_order: notification.display_order ?? 0
            }])
            .select()
            .single();

        if (error) throw error;
        return { data, error: null };
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
        const { data, error } = await supabase
            .from('notifications')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return { data, error: null };
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
        const { error } = await supabase
            .from('notifications')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return { success: true, error: null };
    } catch (error) {
        console.error('Error deleting notification:', error);
        return { success: false, error };
    }
};

/**
 * Reorder notifications by updating their display_order
 * @param {Array<{id: string, display_order: number}>} notifications - Array of notifications with new order
 * @returns {Promise<{success: boolean, error: Error|null}>}
 */
export const reorderNotifications = async (notifications) => {
    try {
        // Update each notification's display_order
        const updates = notifications.map((notification, index) =>
            supabase
                .from('notifications')
                .update({ display_order: index })
                .eq('id', notification.id)
        );

        await Promise.all(updates);
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
    try {
        const { data, error } = await supabase
            .from('notifications')
            .update({ is_active: isActive })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error toggling notification status:', error);
        return { data: null, error };
    }
};
