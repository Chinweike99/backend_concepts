import { Controller, Get, Header, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { Throttle } from '@nestjs/throttler';

@Controller('me')
export class ProfileController {
    constructor(private readonly profileService: ProfileService){};

    @Get()
    @Throttle({ short: { limit: 3, ttl: 10000 } })
    @HttpCode(HttpStatus.OK)
    @Header('Content-Type', 'application/json')
    @Header('Access-Control-Allow-Origin', '*')
    async getProfile(){
        const user = await this.profileService.getProfileWithFact();
        return user
    }

}
