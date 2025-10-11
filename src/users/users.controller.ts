import { Body, Controller, Delete, Get, Param, Post, Put, UsePipes, ValidationPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { Prisma } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
    constructor(private readonly userService: UsersService){}

    @Post()
    @UsePipes(new ValidationPipe({whitelist: true}))
    create(@Body()dto: CreateUserDto){
        return this.userService.create(dto);
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
