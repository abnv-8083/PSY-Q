/**
 * Razorpay Payment Handler
 * Handles payment processing for mock test reattempts
 */

// Load Razorpay script dynamically
export const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

/**
 * Initialize Razorpay payment
 * @param {Object} options - Payment options
 * @param {number} options.amount - Amount in rupees (will be converted to paise)
 * @param {string} options.testName - Name of the test
 * @param {string} options.testId - ID of the test
 * @param {Object} options.user - User object with email and name
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onFailure - Failure callback
 */
export const initiateRazorpayPayment = async (options) => {
    const { amount, testName, testId, bundleId, isBundle, user, onSuccess, onFailure } = options;

    // Load Razorpay script
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
        console.error('Razorpay SDK failed to load');
        onFailure?.('Failed to load payment gateway');
        return;
    }

    // Get Razorpay key from environment
    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;

    if (!razorpayKey || razorpayKey === 'your_razorpay_key_id_here') {
        console.error('Razorpay key not configured');
        onFailure?.('Payment gateway not configured. Please contact support.');
        return;
    }

    // Razorpay options
    const razorpayOptions = {
        key: razorpayKey,
        amount: amount * 100, // Convert to paise
        currency: 'INR',
        name: 'PSY-Q Mock Tests',
        description: isBundle ? `Bundle: ${testName}` : `Reattempt: ${testName}`,
        image: '/logo.png', // Add your logo path
        handler: function (response) {
            // Payment successful
            console.log('Payment successful:', response);
            onSuccess?.({
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                signature: response.razorpay_signature,
                testId: isBundle ? null : testId,
                bundleId: isBundle ? bundleId : null,
                isBundle,
                amount
            });
        },
        prefill: {
            name: user?.displayName || user?.name || '',
            email: user?.email || '',
        },
        notes: {
            testId: isBundle ? null : testId,
            bundleId: isBundle ? bundleId : null,
            testName,
            purpose: isBundle ? 'bundle_purchase' : 'mock_test_reattempt'
        },
        theme: {
            color: '#E91E63'
        },
        modal: {
            ondismiss: function () {
                console.log('Payment cancelled by user');
                onFailure?.('Payment cancelled');
            }
        }
    };

    // Create Razorpay instance and open checkout
    const razorpay = new window.Razorpay(razorpayOptions);
    razorpay.open();
};

/**
 * Verify payment on backend (placeholder)
 * In production, this should call your backend API to verify the payment signature
 */
export const verifyPayment = async (paymentData) => {
    // TODO: Implement backend verification
    // This should call your backend API to verify the payment signature
    console.log('Payment verification (client-side):', paymentData);
    return true;
};
