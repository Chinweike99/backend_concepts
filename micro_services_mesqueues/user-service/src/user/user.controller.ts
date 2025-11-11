import { Controller, Get, Post, Body, Param, Put, HttpCode, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '../entities/user.entity';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto): Promise<{ success: boolean; data: User; message: string }> {
    const user = await this.userService.create(createUserDto);
    return {
      success: true,
      data: user,
      message: 'User created successfully'
    };
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<{ success: boolean; data: User; message: string }> {
    const user = await this.userService.findById(id);
    return {
      success: true,
      data: user,
      message: 'User retrieved successfully'
    };
  }

  @Get('email/:email')
  async findByEmail(@Param('email') email: string): Promise<{ success: boolean; data: User; message: string }> {
    const user = await this.userService.findByEmail(email);
    return {
      success: true,
      data: user,
      message: 'User retrieved successfully'
    };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto
  ): Promise<{ success: boolean; data: User; message: string }> {
    const user = await this.userService.update(id, updateUserDto);
    return {
      success: true,
      data: user,
      message: 'User updated successfully'
    };
  }

  @Get(':id/preferences')
  async getPreferences(@Param('id') id: string): Promise<{ success: boolean; data: unknown; message: string }> {
    const preferences = await this.userService.getUserPreferences(id);
    return {
      success: true,
      data: preferences,
      message: 'Preferences retrieved successfully'
    };
  }
}