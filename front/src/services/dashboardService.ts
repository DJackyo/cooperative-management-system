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

const unwrapResponseData = <T>(payload: unknown): T => {
  let current = payload as { data?: unknown };
  for (let depth = 0; depth < 3 && current && typeof current === 'object' && 'data' in current; depth += 1) {
    current = current.data as { data?: unknown };
  }
  return current as T;
};

export const dashboardService = {
  async getDashboardData(): Promise<DashboardData> {
    try {
      const response = await axiosClient.get('/dashboard/stats');
      console.log('Dashboard stats response:', response.data);
      // Extraer data si viene en formato {status, data, message}
      const data = unwrapResponseData<DashboardData>(response.data);
      return data as DashboardData;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  },

  async getRecentTransactions(): Promise<Transaction[]> {
    try {
      const response = await axiosClient.get('/dashboard/recent-transactions');
      // Extraer data si viene en formato {status, data, message}
      const data = unwrapResponseData<Transaction[]>(response.data);
      return Array.isArray(data) ? data : [];
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
  },

  async getSavingsProjection(): Promise<{projected: number, registered: number, percentage: number}> {
    try {
      const response = await axiosClient.get('/dashboard/savings-projection');
      const data = unwrapResponseData<{ projected?: number; registered?: number; percentage?: number }>(response.data);
      return {
        projected: Number(data?.projected) || 0,
        registered: Number(data?.registered) || 0,
        percentage: Number(data?.percentage) || 0,
      };
    } catch (error) {
      console.error('Error fetching savings projection:', error);
      throw error;
    }
  },

  async generateYearProjection(year: number): Promise<{message: string, created: number}> {
    try {
      const response = await axiosClient.get(`/dashboard/generate-projection/${year}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error generating year projection:', error);
      throw error;
    }
  },

  async generateCurrentYearMetas(): Promise<{message: string, created: number, updated: number}> {
    try {
      const response = await axiosClient.get('/dashboard/generate-current-metas');
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error generating current year metas:', error);
      throw error;
    }
  }
};
