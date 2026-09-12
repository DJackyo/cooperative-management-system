export interface DashboardData {
    totalUsers: number;
    activeCredits: number;
    pendingCredits: number;
    totalCreditAmount?: number;
    overdueCredits?: number;
    completedCredits?: number;
    savingsTransactions: Array<any>; // Ajusta según la estructura real
    pendingPaymentSupports: number;
    deactivationRequests: Array<any>; // Ajusta según la estructura real
  }