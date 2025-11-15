import { axiosClient } from './axiosClient';

export interface DashboardData {
  totalUsers: number;
  activeCredits: number;
  pendingCredits: number;
  totalCreditAmount?: number;
  overdueCredits?: number;
  savingsTransactions: number[];
  savingsLabels?: string[];
  pendingPaymentSupports: number;
  deactivationRequests: number[];
  recentTransactions?: Transaction[];
  usersByStatus?: UserStatus[];
}

export interface UserStatus {
  status: string;
  count: number;
}

export interface Transaction {
  id: string;
  type: 'payment_support' | 'credit_approved' | 'savings' | 'payment';
  amount: number;
  user: string;
  timestamp: string;
  description: string;
}

export const dashboardService = {
  async getDashboardData(): Promise<DashboardData> {
    try {
      const response = await axiosClient.get('/dashboard/stats');
      console.log('Dashboard stats response:', response.data);
      // Extraer data si viene en formato {status, data, message}
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  },

  async getRecentTransactions(): Promise<Transaction[]> {
    try {
      const response = await axiosClient.get('/dashboard/recent-transactions');
      // Extraer data si viene en formato {status, data, message}
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
      throw error;
    }
  },

  async getPendingPaymentSupports(): Promise<number> {
    try {
      const response = await axiosClient.get('/dashboard/pending-supports');
      return response.data.count;
    } catch (error) {
      console.error('Error fetching pending payment supports:', error);
      throw error;
    }
  }
};