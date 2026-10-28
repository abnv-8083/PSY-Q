const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Fetch all tests
 * @param {string} subjectId - Optional subject filtering
 * @returns {Promise<Array>} Array of tests
 */
export const fetchTests = async (subjectId, options = {}) => {
    const params = new URLSearchParams();
    if (subjectId) params.append('subjectId', subjectId);
    if (options.limit !== undefined) {
        params.append('limit', options.limit);
    } else {
        // Pass limit=1000 to ensure full collection is fetched across all backend versions
        params.append('limit', '1000');
    }
    if (options.page !== undefined) params.append('page', options.page);

    const queryString = params.toString();
    const url = `${API_URL}/tests${queryString ? `?${queryString}` : ''}`;
    const response = await fetch(url);
    const result = await response.json();
    if (!result.success) throw new Error(result.message);
    // Return full result so callers can access subject_total_questions, pagination, etc.
    return result;
};

/**
 * Fetch a single test by ID
 * @param {string} id - Test ID
 * @returns {Promise<Object>} Test object
 */
export const fetchTestById = async (id) => {
    const response = await fetch(`${API_URL}/tests/${id}`);
    const result = await response.json();
    if (!result.success) throw new Error(result.message);
    return result.data;
};

/**
 * Create a new test
 * @param {Object} testData - Test data
 * @returns {Promise<Object>} Created test
 */
export const createTest = async (testData) => {
    const response = await fetch(`${API_URL}/tests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.message);
    return result.data;
};

/**
 * Update a test
 * @param {string} id - Test ID
 * @param {Object} testData - Updated data
 * @returns {Promise<Object>} Updated test
 */
export const updateTest = async (id, testData) => {
    const response = await fetch(`${API_URL}/tests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.message);
    return result.data;
};

/**
 * Fetch questions for a specific test
 * @param {string} testId - Test ID
 * @returns {Promise<Array>} Questions array
 */
export const fetchTestQuestions = async (testId, { includeAnswers = false, limit = 1000, page } = {}) => {
    const params = new URLSearchParams();
    if (includeAnswers) params.append('include_answers', 'true');
    if (limit !== undefined) params.append('limit', limit);
    if (page !== undefined) params.append('page', page);
    const queryString = params.toString();
    const response = await fetch(`${API_URL}/tests/${testId}/questions${queryString ? `?${queryString}` : ''}`);
    const result = await response.json();
    if (!result.success) throw new Error(result.message);
    return result.data;
};

/**
 * Remove a test
 * @param {string} id - Test ID
 */
export const deleteTest = async (id) => {
    const response = await fetch(`${API_URL}/tests/${id}`, {
        method: 'DELETE'
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.message);
};

/**
 * Submit test result
 * @param {Object} resultData - Result data
 * @returns {Promise<Object>} Created result
 */
export const submitResult = async (resultData) => {
    const response = await fetch(`${API_URL}/results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resultData)
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.message);
    return result.data;
};

/**
 * Fetch latest result for a user and test
 * @param {string} testId - Test ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Latest result
 */
export const fetchLatestResult = async (testId, userId) => {
    const response = await fetch(`${API_URL}/results/latest?testId=${testId}&userId=${userId}`);
    const result = await response.json();
    if (!result.success) throw new Error(result.message);
    return result.data;
};

/**
 * Fetch all attempts for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of attempts
 */
export const fetchUserAttempts = async (userId) => {
    const response = await fetch(`${API_URL}/user/attempts?userId=${userId}`);
    const result = await response.json();
    if (!result.success) throw new Error(result.message);
    return result.data;
};

/**
 * Fetch all items a user has access to
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of item IDs
 */
export const fetchUserAccess = async (userId) => {
    const response = await fetch(`${API_URL}/user/access?userId=${userId}`);
    const result = await response.json();
    if (!result.success) throw new Error(result.message);
    return result.data;
};

// ─── Marketing / Promo ───────────────────────────────────────────

/**
 * Admin: Set marketing schedule for a test
 * @param {string} testId - Test ID
 * @param {Object} schedule - { marketing_enabled, marketing_start, marketing_end, marketing_slug }
 */
export const setMarketingSchedule = async (testId, schedule) => {
    const response = await fetch(`${API_URL}/admin/tests/${testId}/marketing`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(schedule)
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.message);
    return result.data;
};

/**
 * Public: Fetch marketing test info by slug
 * @param {string} slug - Marketing link slug
 * @returns {Promise<Object>} Test info with is_currently_free flag
 */
export const fetchMarketingTest = async (slug) => {
    const response = await fetch(`${API_URL}/marketing/${slug}`);
    const result = await response.json();
    if (!result.success) throw new Error(result.message);
    return result.data;
};
