// src/services/userService.ts
import { User } from '@/interfaces/User';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

const mock = new MockAdapter(axios);

// Mockear la respuesta de obtener usuarios
mock.onGet('/api/users').reply(200, [
    { id: 1, names: 'Juan Soto', email: 'juan@example.com', role: 'Socio', status: 'activo', identification: '123456789', contactData: 'contactData', locationData: 'locationData' },
    { id: 2, names: 'Ana Chan', email: 'ana@example.com', role: 'Socio', status: 'inactivo', identification: '223456789', contactData: 'contactData', locationData: 'locationData' },
    { id: 3, names: 'María Perez', email: 'ana@example.com', role: 'Socio', status: 'activo', identification: '223456789', contactData: 'contactData', locationData: 'locationData' },
    { id: 4, names: 'Pedro Fernandez', email: 'ana@example.com', role: 'Gestor', status: 'activo', identification: '223456789', contactData: 'contactData', locationData: 'locationData' },
]);

// Mockear la respuesta al crear un usuario
mock.onPost('/api/users').reply((config) => {
    const { names, email, role } = JSON.parse(config.data);
    return [201, { id: Date.now(), names, email, role, status: 'activo' }];
});

// Mockear la respuesta al actualizar un usuario
mock.onPut(/\/api\/users\/\d+/).reply((config) => {
    const id = parseInt(config.url!.split('/').pop()!);
    const { names, email, role } = JSON.parse(config.data);
    return [200, { id, names, email, role, status: 'activo' }];
});

// Mockear la respuesta al eliminar un usuario (marcar como inactivo)
mock.onDelete(/\/api\/users\/\d+/).reply((config) => {
    const id = parseInt(config.url!.split('/').pop()!);
    return [200, { id, status: 'inactivo' }]; // Marcar como inactivo
});

export const fetchUsers = () => axios.get('/api/users');
export const createUser = (user: Omit<User, "id" | "status">) => axios.post('/api/users', user);
export const updateUser = (id: number, user: Omit<User, "id" | "status">) => axios.put(`/api/users/${id}`, user);
export const deleteUser = (id: number) => axios.delete(`/api/users/${id}`);
