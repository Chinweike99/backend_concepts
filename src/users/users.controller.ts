import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import { Prisma } from '@prisma/client';

@Controller('users')
export class UsersController {
    constructor(private readonly userService: UsersService){}

    @Post()
    create(@Body() data: Prisma.UserCreateInput){
        return this.userService.create(data);
    };

    @Get()
    findAll(){
        return this.userService.findAll()
    }

    @Get(":id")
    findOne(@Param('id') id: string){
        return this.userService.findOne(Number(id))
    }
    
    @Delete(":id")
    remove(@Param('id') id: string){
        return this.userService.remove(Number(id))
    }

    @Put('id')
    update(@Param('id') id: string, data: Prisma.UserUpdateInput){
        return this.userService.update(Number(id), data)
    }

}
