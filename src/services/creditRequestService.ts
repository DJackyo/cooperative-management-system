// src/services/creditRequestService.ts
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

// Crea una instancia de MockAdapter
const mock = new MockAdapter(axios);

// Mockear la respuesta para obtener solicitudes de crédito
mock.onGet('/api/credit-requests').reply(200, [
    { id: 1, name: 'Juan Pérez', amountRequested: 15000, requestDate: '2024-10-01', status: 'pendiente' },
    { id: 2, name: 'Ana Gómez', amountRequested: 43000, requestDate: '2024-10-02', status: 'aprobado' },
    { id: 3, name: 'Pedro Chan', amountRequested: 13000, requestDate: '2024-10-02', status: 'pendiente' },
    { id: 4, name: 'Jaime López', amountRequested: 23000, requestDate: '2024-10-02', status: 'pendiente' },
    { id: 5, name: 'María Ruiz', amountRequested: 33000, requestDate: '2024-10-02', status: 'aprobado' },
]);

// Mockear la respuesta para aprobar una solicitud de crédito
mock.onPost(/\/api\/credit-requests\/\d+\/approve/).reply((config) => {
    const requestId = config.url?.split('/').pop(); // Obtén el ID de la solicitud de la URL
    return [200, { message: `Solicitud de crédito ${requestId} aprobada.` }];
});

// Mockear la respuesta para rechazar una solicitud de crédito
mock.onPost(/\/api\/credit-requests\/\d+\/reject/).reply((config) => {
    const requestId = config.url?.split('/').pop(); // Obtén el ID de la solicitud de la URL
    return [200, { message: `Solicitud de crédito ${requestId} rechazada.` }];
});

// Mockear la respuesta al obtener el plan de pagos
mock.onGet(/\/api\/credit-requests\/\d+\/payment-plan/).reply((config) => {
    const creditId = config.url?.match(/\/(\d+)\/payment-plan/)[1];
    console.log("ID de crédito capturado:", creditId);
    // Simulación de un plan de pagos para el crédito específico
    const paymentPlan = [
        { amount: 200, dueDate: "2024-11-30" },
        { amount: 150, dueDate: "2024-12-30" },
    ];

    return [200, { creditId, paymentPlan }];
});



// Funciones para interactuar con el API
export const fetchCreditRequests = () => axios.get('/api/credit-requests');
export const approveCreditRequest = (id: number) => axios.post(`/api/credit-requests/${id}/approve`);
export const rejectCreditRequest = (id: number) => axios.post(`/api/credit-requests/${id}/reject`);
// Función para obtener el plan de pagos
export const fetchPaymentPlanByCreditId = (creditId: number) => {
    return axios.get(`/api/credit-requests/${creditId}/payment-plan`);
};