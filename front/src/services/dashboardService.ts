import { axiosClient } from './axiosClient';

export interface LoanCollectionData {
  totalCollected: number;
  totalCapital: number;
  totalInterest: number;
  totalMora: number;
  totalProteccion?: number;
  totalPaymentsCount: number;
  avgPayment?: number;
}

/** Período aplicado a las estadísticas del dashboard. */
export interface DashboardPeriod {
  /** Año seleccionado o null cuando se consulta el histórico completo. */
  year: number | null;
  isAllYears: boolean;
  label: string;
}

/** Resumen de ahorros del período consultado. */
export interface SavingsSummary {
  totalSaved: number;
  aportesCount: number;
  periodsWithActivity: number;
  totalPeriods: number;
  avgPerActivePeriod: number;
  lastPeriodLabel: string | null;
  lastPeriodTotal: number;
  bestPeriodLabel: string | null;
  bestPeriodTotal: number;
}

/** Créditos registrados en el período, sin importar el estado. */
export interface CreditsInPeriod {
  count: number;
  amount: number;
}

export interface DashboardData {
  /** Período aplicado al cálculo de los indicadores. */
  period?: DashboardPeriod;
  /** Años con información disponible para el selector. */
  availableYears?: number[];

  // --- Sección de créditos ---
  activeCredits: number;
  pendingCredits: number;
  completedCredits?: number;
  approvedCredits?: number;
  totalCreditAmount?: number;
  overdueCredits?: number;
  creditCountsByStatus?: UserStatus[];
  creditsInPeriod?: CreditsInPeriod;
  loanCollection?: LoanCollectionData;

  // --- Sección de ahorros ---
  savingsTransactions: number[];
  savingsLabels?: string[];
  /** 'month' cuando hay un año seleccionado, 'year' para el histórico completo. */
  savingsGroupBy?: 'month' | 'year';
  savingsSummary?: SavingsSummary;

  // --- Asociados y pendientes ---
  totalUsers: number;
  usersByStatus?: UserStatus[];
  pendingPaymentSupports: number;
  deactivationRequests: number[];
  recentTransactions?: Transaction[];
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
  /**
   * Estadísticas generales del dashboard.
   * @param year Año a consultar. `null`/`undefined` devuelve el histórico completo.
   */
  async getDashboardData(year?: number | null): Promise<DashboardData> {
    try {
      const response = await axiosClient.get('/dashboard/stats', {
        params: year ? { year } : undefined,
      });
      // Extraer data si viene en formato {status, data, message}
      const data = unwrapResponseData<DashboardData>(response.data);
      return data as DashboardData;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  },

  /** Años con información disponible para el selector de período. */
  async getAvailableYears(): Promise<number[]> {
    try {
      const response = await axiosClient.get('/dashboard/years');
      const data = unwrapResponseData<number[]>(response.data);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching available years:', error);
      return [];
    }
  },

  async getRecentTransactions(year?: number | null): Promise<Transaction[]> {
    try {
      const response = await axiosClient.get('/dashboard/recent-transactions', {
        params: year ? { year } : undefined,
      });
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

  /**
   * Proyección de ahorros (metas vs. registrado).
   * @param year Año de la proyección. Sin año, el backend usa el año en curso.
   */
  async getSavingsProjection(
    year?: number | null,
  ): Promise<{ year: number | null; projected: number; registered: number; percentage: number }> {
    try {
      const response = await axiosClient.get('/dashboard/savings-projection', {
        params: year ? { year } : undefined,
      });
      const data = unwrapResponseData<{
        year?: number;
        projected?: number;
        registered?: number;
        percentage?: number;
      }>(response.data);
      return {
        year: Number(data?.year) || year || null,
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

  /**
   * Genera/actualiza las metas de ahorro.
   * @param year Año a generar (el seleccionado en el dashboard). Se envía siempre
   *             que exista; sin año (`null`/`undefined`) el backend usa el año en curso.
   */
  async generateCurrentYearMetas(year?: number | null): Promise<{message: string, created: number, updated: number}> {
    try {
      const response = await axiosClient.get('/dashboard/generate-current-metas', {
        params: year ? { year } : undefined,
      });
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error generating metas:', error);
      throw error;
    }
  }
};
