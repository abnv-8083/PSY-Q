const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Fetch all subjects
 * @returns {Promise<Array>} Array of subjects
 */
export const fetchSubjects = async () => {
    const response = await fetch(`${API_URL}/subjects`);
    const result = await response.json();
    if (!result.success) throw new Error(result.message);
    return result.data;
};

/**
 * Find or create a subject by name
 * @param {string} name - Subject name
 * @param {string} description - Optional description
 * @returns {Promise<Object>} The subject object
 */
export const ensureSubject = async (name, description = '') => {
    const subjects = await fetchSubjects();
    const existing = subjects.find(s => s.name === name);
    
    if (existing) return existing;
    
    // Create it if it doesn't exist
    const response = await fetch(`${API_URL}/subjects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description })
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.message);
    return result.data;
};
