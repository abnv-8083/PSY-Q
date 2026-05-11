const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Fetch all bundles with their associated tests
 * @returns {Promise<Array>} Array of bundles
 */
export const fetchBundles = async () => {
    const response = await fetch(`${API_URL}/bundles`);
    const result = await response.json();
    if (!result.success) throw new Error(result.message);
    
    // Calculate values frontend expects
    return result.data.map(bundle => ({
        ...bundle,
        id: bundle._id || bundle.id, // For mongo compatibility
        discount_percentage: bundle.offer_price
            ? Math.round(((bundle.regular_price - bundle.offer_price) / bundle.regular_price) * 100)
            : 0,
        tests: (bundle.tests || []).map(test => ({
            ...(typeof test === 'object' ? test : {}),
            id: test._id || test.id || (typeof test === 'string' ? test : null)
        }))
    }));
};

/**
 * Fetch a single bundle by ID
 * @param {string} bundleId - ID of the bundle
 * @returns {Promise<Object>} Bundle object
 */
export const fetchBundleById = async (bundleId) => {
    const response = await fetch(`${API_URL}/bundles/${bundleId}`);
    const result = await response.json();
    if (!result.success) throw new Error(result.message);
    const bundle = result.data;
    if (bundle) {
        bundle.id = bundle._id || bundle.id;
        if (bundle.tests) {
            bundle.tests = bundle.tests.map(t => ({
                ...(typeof t === 'object' ? t : {}),
                id: (typeof t === 'object' ? (t._id || t.id) : t)
            }));
        }
    }
    return bundle;
};

/**
 * Update bundle configuration
 * @param {string} bundleId - ID of the bundle
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated bundle
 */
export const updateBundle = async (bundleId, updates) => {
    const response = await fetch(`${API_URL}/admin/bundles/${bundleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.message);
    return result.data;
};

/**
 * Reorder bundles
 * @param {Array} bundles - Array of bundles with new order
 */
export const reorderBundles = async (bundles) => {
    const response = await fetch(`${API_URL}/admin/bundles/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bundles })
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.message);
    return result.data;
};

/**
 * Add test to bundle
 * @param {string} bundleId - ID of the bundle
 * @param {string} testId - ID of the test
 * @returns {Promise<Object>} Created/updated link record
 */
export const addTestToBundle = async (bundleId, testId) => {
    const bundleRes = await fetch(`${API_URL}/bundles/${bundleId}`);
    const bundleResJson = await bundleRes.json();
    const bundle = bundleResJson.data;

    // Extract plain IDs from populated objects or raw ID strings
    const existingIds = (bundle.tests || []).map(t =>
        (typeof t === 'object' ? (t._id || t.id) : t).toString()
    );

    // Add only if not already present
    if (!existingIds.includes(testId.toString())) {
        existingIds.push(testId);
    }

    return updateBundle(bundleId, { tests: existingIds });
};

/**
 * Remove test from bundle
 * @param {string} bundleId - ID of the bundle
 * @param {string} testId - ID of the test
 */
export const removeTestFromBundle = async (bundleId, testId) => {
    const bundleRes = await fetch(`${API_URL}/bundles/${bundleId}`);
    const bundleResJson = await bundleRes.json();
    const bundle = bundleResJson.data;

    // Extract plain IDs from populated objects or raw ID strings, then filter out the target
    const updatedIds = (bundle.tests || [])
        .map(t => (typeof t === 'object' ? (t._id || t.id) : t).toString())
        .filter(id => id !== testId.toString());

    return updateBundle(bundleId, { tests: updatedIds });
};

/**
 * Update bundle features
 * @param {string} bundleId - ID of the bundle
 * @param {Array<string>} features - Array of feature strings
 * @returns {Promise<Object>} Updated bundle
 */
export const updateBundleFeatures = async (bundleId, features) => {
    return updateBundle(bundleId, { features });
};

export const createBundle = async (bundleData) => {
    const response = await fetch(`${API_URL}/admin/bundles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bundleData)
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.message);
    return { ...result.data, id: result.data._id || result.data.id };
};

export const deleteBundle = async (bundleId) => {
    const response = await fetch(`${API_URL}/admin/bundles/${bundleId}`, {
        method: 'DELETE'
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.message);
    return result;
};

/**
 * Get all tests available (placeholder for consistency)
 */
export const fetchAvailableTests = async () => {
    const response = await fetch(`${API_URL}/tests`);
    const result = await response.json();
    if (!result.success) throw new Error(result.message);
    return (result.data || []).map(test => ({
        ...test,
        id: test._id || test.id
    }));
};
