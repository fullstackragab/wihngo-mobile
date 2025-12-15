import {
  AddPayoutMethodDto,
  PayoutBalance,
  PayoutHistoryItem,
  PayoutMethod,
  PayoutSummary,
  UpdatePayoutMethodDto,
} from "@/types/payout";
import { apiHelper } from "./api-helper";

const PAYOUT_ENDPOINT = "/api/payouts";

export const payoutService = {
  /**
   * Get current payout balance for the authenticated user
   */
  async getBalance(): Promise<PayoutBalance> {
    try {
      const response = await apiHelper.get<PayoutBalance>(
        `${PAYOUT_ENDPOINT}/balance`
      );
      return response;
    } catch (error) {
      console.error("Error fetching payout balance:", error);
      throw error;
    }
  },

  /**
   * Get all payout methods for the authenticated user
   */
  async getPayoutMethods(): Promise<PayoutMethod[]> {
    try {
      const response = await apiHelper.get<{ methods: PayoutMethod[] }>(
        `${PAYOUT_ENDPOINT}/methods`
      );
      return response.methods;
    } catch (error) {
      console.error("Error fetching payout methods:", error);
      throw error;
    }
  },

  /**
   * Get a single payout method by ID
   */
  async getPayoutMethod(methodId: string): Promise<PayoutMethod> {
    try {
      const response = await apiHelper.get<PayoutMethod>(
        `${PAYOUT_ENDPOINT}/methods/${methodId}`
      );
      return response;
    } catch (error) {
      console.error("Error fetching payout method:", error);
      throw error;
    }
  },

  /**
   * Add a new payout method
   */
  async addPayoutMethod(data: AddPayoutMethodDto): Promise<PayoutMethod> {
    try {
      const response = await apiHelper.post<PayoutMethod>(
        `${PAYOUT_ENDPOINT}/methods`,
        data
      );
      return response;
    } catch (error) {
      console.error("Error adding payout method:", error);
      throw error;
    }
  },

  /**
   * Update a payout method (e.g., set as default)
   */
  async updatePayoutMethod(
    methodId: string,
    data: UpdatePayoutMethodDto
  ): Promise<PayoutMethod> {
    try {
      const response = await apiHelper.patch<PayoutMethod>(
        `${PAYOUT_ENDPOINT}/methods/${methodId}`,
        data
      );
      return response;
    } catch (error) {
      console.error("Error updating payout method:", error);
      throw error;
    }
  },

  /**
   * Delete a payout method
   */
  async deletePayoutMethod(methodId: string): Promise<void> {
    try {
      await apiHelper.delete(`${PAYOUT_ENDPOINT}/methods/${methodId}`);
    } catch (error) {
      console.error("Error deleting payout method:", error);
      throw error;
    }
  },

  /**
   * Set a payout method as default
   */
  async setDefaultPayoutMethod(methodId: string): Promise<PayoutMethod> {
    try {
      return await this.updatePayoutMethod(methodId, { isDefault: true });
    } catch (error) {
      console.error("Error setting default payout method:", error);
      throw error;
    }
  },

  /**
   * Get payout transaction history
   */
  async getPayoutHistory(
    page: number = 1,
    pageSize: number = 20,
    status?: string
  ): Promise<{
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    items: PayoutHistoryItem[];
  }> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });

      if (status) {
        params.append("status", status);
      }

      const response = await apiHelper.get<{
        page: number;
        pageSize: number;
        totalCount: number;
        totalPages: number;
        items: PayoutHistoryItem[];
      }>(`${PAYOUT_ENDPOINT}/history?${params.toString()}`);

      return response;
    } catch (error) {
      console.error("Error fetching payout history:", error);
      throw error;
    }
  },

  /**
   * Get payout summary (total earned, paid out, fees, etc.)
   */
  async getPayoutSummary(): Promise<PayoutSummary> {
    try {
      const response = await apiHelper.get<PayoutSummary>(
        `${PAYOUT_ENDPOINT}/summary`
      );
      return response;
    } catch (error) {
      console.error("Error fetching payout summary:", error);
      throw error;
    }
  },
};
