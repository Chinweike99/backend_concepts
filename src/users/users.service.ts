import { Injectable } from '@nestjs/common';
import { Prisma, User} from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
    constructor (private prisma: PrismaService){}

    async create(data: Prisma.UserCreateInput): Promise<User>{
        return this.prisma.user.create({data})
    }

    async findAll(): Promise<User[]>{
        return this.prisma.user.findMany();
    }

    async findOne(id: number): Promise<User | null>{
        return this.prisma.user.findUnique({where: {id}})
    }

    async update(id: number, data: Prisma.UserUpdateInput):Promise<User | null> {
        return this.prisma.user.update({
            where: {id},
            data
        })
    }

    async remove(id: number): Promise<User>{
        return this.prisma.user.delete({
            where: {id}
        })
    }

}
