import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService){};

    @Post('register')
    async register(@Body() body: CreateUserDto){
        return this.authService.register(body)
    }

    @Post('login')
    async login(@Body() body: any){
        return this.authService.login(body)
    }

}
