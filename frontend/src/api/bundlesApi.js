import { supabase } from '../lib/supabaseClient';

/**
 * Fetch all bundles with their associated tests
 * @returns {Promise<Array>} Array of bundles with calculated discount percentages
 */
export const fetchBundles = async () => {
    const { data, error } = await supabase
        .from('bundles')
        .select(`
      *,
      bundle_tests (
        test_id,
        added_at,
        tests (*)
      )
    `)
        .order('display_order', { ascending: true });

    if (error) throw error;

    // Calculate discount percentage for each bundle
    return data.map(bundle => ({
        ...bundle,
        discount_percentage: bundle.offer_price
            ? Math.round(((bundle.regular_price - bundle.offer_price) / bundle.regular_price) * 100)
            : 0,
        tests: bundle.bundle_tests?.map(bt => bt.tests) || []
    }));
};

/**
 * Fetch a single bundle by type
 * @param {string} bundleType - 'BASIC', 'ADVANCED', or 'PREMIUM'
 * @returns {Promise<Object>} Bundle object with tests and discount
 */
export const fetchBundleByType = async (bundleType) => {
    const { data, error } = await supabase
        .from('bundles')
        .select(`
      *,
      bundle_tests (
        test_id,
        added_at,
        tests (*)
      )
    `)
        .eq('bundle_type', bundleType)
        .single();

    if (error) throw error;

    return {
        ...data,
        discount_percentage: data.offer_price
            ? Math.round(((data.regular_price - data.offer_price) / data.regular_price) * 100)
            : 0,
        tests: data.bundle_tests?.map(bt => bt.tests) || []
    };
};

/**
 * Fetch a single bundle by ID
 * @param {string} bundleId - UUID of the bundle
 * @returns {Promise<Object>} Bundle object with tests and discount
 */
export const fetchBundleById = async (bundleId) => {
    const { data, error } = await supabase
        .from('bundles')
        .select(`
      *,
      bundle_tests (
        test_id,
        added_at,
        tests (*)
      )
    `)
        .eq('id', bundleId)
        .single();

    if (error) throw error;

    return {
        ...data,
        discount_percentage: data.offer_price
            ? Math.round(((data.regular_price - data.offer_price) / data.regular_price) * 100)
            : 0,
        tests: data.bundle_tests?.map(bt => bt.tests) || []
    };
};

/**
 * Update bundle configuration
 * @param {string} bundleId - UUID of the bundle
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated bundle
 */
export const updateBundle = async (bundleId, updates) => {
    // Validate offer_price <= regular_price
    if (updates.offer_price !== undefined && updates.regular_price !== undefined) {
        if (updates.offer_price > updates.regular_price) {
            throw new Error('Offer price cannot be higher than regular price');
        }
    }

    // If only updating offer_price, fetch current regular_price for validation
    if (updates.offer_price !== undefined && updates.regular_price === undefined) {
        const { data: currentBundle } = await supabase
            .from('bundles')
            .select('regular_price')
            .eq('id', bundleId)
            .single();

        if (currentBundle && updates.offer_price > currentBundle.regular_price) {
            throw new Error('Offer price cannot be higher than regular price');
        }
    }

    const { data, error } = await supabase
        .from('bundles')
        .update(updates)
        .eq('id', bundleId)
        .select()
        .single();

    if (error) throw error;
    return data;
};

/**
 * Add test to bundle
 * @param {string} bundleId - UUID of the bundle
 * @param {string} testId - UUID of the test
 * @returns {Promise<Object>} Created bundle_test record
 */
export const addTestToBundle = async (bundleId, testId) => {
    // Check if already exists
    const { data: existing } = await supabase
        .from('bundle_tests')
        .select('*')
        .eq('bundle_id', bundleId)
        .eq('test_id', testId)
        .single();

    if (existing) {
        throw new Error('This test is already in the bundle');
    }

    const { data, error } = await supabase
        .from('bundle_tests')
        .insert({ bundle_id: bundleId, test_id: testId })
        .select();

    if (error) throw error;
    return data[0];
};

/**
 * Remove test from bundle
 * @param {string} bundleId - UUID of the bundle
 * @param {string} testId - UUID of the test
 */
export const removeTestFromBundle = async (bundleId, testId) => {
    const { error } = await supabase
        .from('bundle_tests')
        .delete()
        .eq('bundle_id', bundleId)
        .eq('test_id', testId);

    if (error) throw error;
};

/**
 * Update bundle features
 * @param {string} bundleId - UUID of the bundle
 * @param {Array<string>} features - Array of feature strings
 * @returns {Promise<Object>} Updated bundle
 */
export const updateBundleFeatures = async (bundleId, features) => {
    const { data, error } = await supabase
        .from('bundles')
        .update({ features })
        .eq('id', bundleId)
        .select()
        .single();

    if (error) throw error;
    return data;
};

/**
 * Get all tests available for assignment to bundles
 * @returns {Promise<Array>} Array of all tests
 */
export const fetchAvailableTests = async () => {
    const { data, error } = await supabase
        .from('tests')
        .select('*, subjects(name)')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
};

/**
 * Get user's purchased bundles
 * @param {string} userId - UUID of the user
 * @returns {Promise<Array>} Array of user's bundles
 */
export const fetchUserBundles = async (userId) => {
    const { data, error } = await supabase
        .from('user_bundles')
        .select(`
      *,
      bundles (*)
    `)
        .eq('user_id', userId);

    if (error) throw error;
    return data;
};

/**
 * Purchase a bundle for a user
 * @param {string} userId - UUID of the user
 * @param {string} bundleId - UUID of the bundle
 * @param {number} pricePaid - Actual price paid
 * @returns {Promise<Object>} Created user_bundle record
 */
export const purchaseBundle = async (userId, bundleId, pricePaid) => {
    const { data, error } = await supabase
        .from('user_bundles')
        .insert({
            user_id: userId,
            bundle_id: bundleId,
            price_paid: pricePaid
        })
        .select();

    if (error) throw error;
    return data[0];
};
