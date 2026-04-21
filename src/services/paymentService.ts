/**
 * Service to handle PhonePe payment operations on the frontend.
 */

export const paymentService = {
  /**
   * Initiates a payment for a specific package.
   * @param packageId The ID of the package to purchase (e.g., 'gold', 'diamond').
   * @param userId The ID of the current user.
   * @returns A promise that resolves to the payment URL or throws an error.
   */
  initiatePayment: async (packageId: string, userId: string): Promise<string> => {
    try {
      const response = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ packageId, userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.details ? `${data.error}: ${data.details}` : (data.error || 'Failed to initiate payment');
        throw new Error(errorMsg);
      }

      if (data.paymentUrl) {
        return data.paymentUrl;
      }

      throw new Error('Payment URL not received from server');
    } catch (error) {
      console.error('Payment Initiation Error:', error);
      throw error;
    }
  },

  /**
   * Checks the status of a transaction.
   * @param transactionId The merchant transaction ID to check.
   * @returns A promise that resolves to the transaction status data.
   */
  checkTransactionStatus: async (transactionId: string): Promise<any> => {
    try {
      const response = await fetch(`/api/payments/status/${transactionId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to check transaction status');
      }

      return data;
    } catch (error) {
      console.error('Status Check Error:', error);
      throw error;
    }
  }
};
