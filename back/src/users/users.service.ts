import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/CreateUserDto';
import { UpdateUserDto } from './dto/UpdateUserDto';


@Injectable()
export class UsersService {
    private readonly users = [
        { id: 1, username: 'admin', email: 'admin@example.com', password: 'password' },
        { id: 2, username: 'user1', email: 'user1@example.com', password: 'password1' },
    ];
    private currentId = 3; // Para simular un ID auto-incremental

    create(createUserDto: CreateUserDto) {
        const newUser = {
            id: this.currentId++,
            ...createUserDto,
        };
        this.users.push(newUser);
        return newUser;
    }

    findAll() {
        return this.users;
    }

    findOne(id: number) {
        const user = this.users.find(user => user.id === id);
        if (!user) {
            throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
        }
        return user;
    }

    update(id: number, updateUserDto: UpdateUserDto) {
        const userIndex = this.users.findIndex(user => user.id === id);
        if (userIndex === -1) {
            throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
        }

        const updatedUser = { ...this.users[userIndex], ...updateUserDto };
        this.users[userIndex] = updatedUser;
        return updatedUser;
    }

    remove(id: number) {
        const userIndex = this.users.findIndex(user => user.id === id);
        if (userIndex === -1) {
            throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
        }

        this.users.splice(userIndex, 1);
        return { message: 'Usuario eliminado correctamente' };
    }
}
