// mockDashboardData.ts
export const fetchDashboardData = () => {
    return new Promise((resolve) => {
        const data = {
            totalUsers: 1200,
            activeCredits: 350,
            pendingCredits: 120,
            savingsTransactions: [300, 400, 250, 500, 450, 600], // Datos de ejemplo
            pendingPaymentSupports: 15,
            deactivationRequests: [5, 7, 8, 4], // Datos por semana o mes
        };
        setTimeout(() => {
            resolve(data);
        }, 1000); // Simulando un retardo en la respuesta
    });
};
