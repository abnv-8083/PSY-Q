const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Fetch all questions (limited)
 * @returns {Promise<Array>} Questions array
 */
export const fetchQuestions = async () => {
    const response = await fetch(`${API_URL}/questions`);
    const result = await response.json();
    if (!result.success) throw new Error(result.message);
    return result.data;
};

/**
 * Create a new question
 * @param {Object} questionData - Question data
 * @returns {Promise<Object>} Created question
 */
export const createQuestion = async (questionData) => {
    const response = await fetch(`${API_URL}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questionData)
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.message);
    return result.data;
};

/**
 * Update an existing question
 * @param {string} id - Question ID
 * @param {Object} questionData - Updated data
 * @returns {Promise<Object>} Updated question
 */
export const updateQuestion = async (id, questionData) => {
    const response = await fetch(`${API_URL}/questions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questionData)
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.message);
    return result.data;
};

/**
 * Remove a question
 * @param {string} id - Question ID
 */
export const deleteQuestion = async (id) => {
    const response = await fetch(`${API_URL}/questions/${id}`, {
        method: 'DELETE'
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.message);
};
