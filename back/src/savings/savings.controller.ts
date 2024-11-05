import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { SavingsService } from './savings.service';
import { CreateSavingsDto } from './dto/CreateSavingsDto';
import { UpdateSavingsDto } from './dto/UpdateSavingsDto';

@Controller('savings')
export class SavingsController {
    constructor(private readonly savingsService: SavingsService) {}

    @Post()
    create(@Body() createSavingsDto: CreateSavingsDto) {
        return this.savingsService.create(createSavingsDto);
    }

    @Get()
    findAll() {
        return this.savingsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: number) {
        return this.savingsService.findOne(id);
    }

    @Put(':id')
    update(@Param('id') id: number, @Body() updateSavingsDto: UpdateSavingsDto) {
        return this.savingsService.update(id, updateSavingsDto);
    }

    @Delete(':id')
    remove(@Param('id') id: number) {
        return this.savingsService.remove(id);
    }
}
