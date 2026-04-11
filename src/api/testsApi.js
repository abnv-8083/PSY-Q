const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Fetch all tests
 * @param {string} subjectId - Optional subject filtering
 * @returns {Promise<Array>} Array of tests
 */
export const fetchTests = async (subjectId) => {
    let url = `${API_URL}/tests`;
    if (subjectId) url += `?subjectId=${subjectId}`;
    const response = await fetch(url);
    const result = await response.json();
    if (!result.success) throw new Error(result.message);
    return result.data;
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
export const fetchTestQuestions = async (testId) => {
    const response = await fetch(`${API_URL}/tests/${testId}/questions`);
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
