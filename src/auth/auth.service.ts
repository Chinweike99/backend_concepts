import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt'

@Injectable()
export class AuthService {
    constructor(
        private userService: UsersService,
        private jwtService: JwtService
    ){};

    async register(data: Prisma.UserCreateInput){
        const existingUser = await this.userService.findByEmail(data.email);
        if(existingUser){
            throw new ConflictException('Email Already Exists')
        };

        const hashed = await bcrypt.hash(data.password, 12);
        const user = await this.userService.create({...data, password: hashed});
        const token = this.signToken(user.id, user.email);
        return {user, token}
    }

    async login(data: {email: string, password: string}){
        const existingUser = await this.userService.findByEmail(data.email);
        if(!existingUser){
            throw new UnauthorizedException("Invalid credentials");
        }

        const isValid = await bcrypt.compare(data.password, existingUser.password);
        if(!isValid) throw new UnauthorizedException("Invalid Credentials");

        const token = this.signToken(existingUser.id, existingUser.email);
        return {existingUser, token}

    }
    
    async signToken(id: number, email: string){
        return this.jwtService.sign({sub: id, email})
    }

}
