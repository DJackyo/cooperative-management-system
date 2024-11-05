import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { CreateUserDto } from './dto/CreateUserDto';
import { UpdateUserDto } from './dto/UpdateUserDto';
import { UsersService } from './users.service';


@Controller('users')
export class UsersController {
    constructor(private readonly userService: UsersService) {}

    @Post()
    create(@Body() createUserDto: CreateUserDto) {
        return this.userService.create(createUserDto);
    }

    @Get()
    findAll() {
        return this.userService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: number) {
        return this.userService.findOne(id);
    }

    @Put(':id')
    update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
        return this.userService.update(id, updateUserDto);
    }

    @Delete(':id')
    remove(@Param('id') id: number) {
        return this.userService.remove(id);
    }
}
