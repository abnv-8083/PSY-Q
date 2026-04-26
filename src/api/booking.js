/**
 * Booking API Client
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const bookSession = async (bookingData) => {
  try {
    const response = await fetch(`${API_URL}/sendBookingEmails`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bookingData)
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Booking API Error:', error);
    return {
      success: false,
      message: 'Network error or server unavailable. Please try again later.'
    };
  }
};
