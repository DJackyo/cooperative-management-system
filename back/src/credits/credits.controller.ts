import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { CreditsService } from './credits.service';
import { CreateCreditDto } from './dto/CreateCreditDto';
import { UpdateCreditDto } from './dto/UpdateCreditDto';

@Controller('credits')
export class CreditsController {
    constructor(private readonly creditsService: CreditsService) {}

    @Post()
    create(@Body() createCreditDto: CreateCreditDto) {
        return this.creditsService.create(createCreditDto);
    }

    @Get()
    findAll() {
        return this.creditsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: number) {
        return this.creditsService.findOne(id);
    }

    @Put(':id')
    update(@Param('id') id: number, @Body() updateCreditDto: UpdateCreditDto) {
        return this.creditsService.update(id, updateCreditDto);
    }

    @Delete(':id')
    remove(@Param('id') id: number) {
        return this.creditsService.remove(id);
    }
}
