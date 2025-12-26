import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Delete,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiKeyService } from './api-key.service';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiSecurity,
  ApiBody,
} from '@nestjs/swagger';
import { CompositeAuthGuard } from 'src/auth/strategy/composite-auth.guard';
import { CreateApiKeyDto, createApiKeySchema } from './dto/api-key.dto';
import { RolloverApiKeyDto, rolloverApiKeySchema } from './dto/rollover-key.dto';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';

@ApiTags('API Keys')
@ApiBearerAuth('JWT-auth')
@ApiSecurity('API-key')
@Controller('keys')
@UseGuards(CompositeAuthGuard)
export class ApiKeyController {
  constructor(private apiKeyService: ApiKeyService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create a new API key' })
  @ApiResponse({ status: 201, description: 'API key created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input or limit reached' })
  @ApiBody({ type: CreateApiKeyDto })
  async create(
    @Request() req,
    @Body() body: any,
  ) {
    // Validate with Zod
    const createApiKeyDto = new ZodValidationPipe(createApiKeySchema).transform(body) as CreateApiKeyDto;
    return this.apiKeyService.createApiKey(req.user.id, createApiKeyDto);
  }

  @Post('rollover')
  @ApiOperation({ summary: 'Rollover an expired API key' })
  @ApiResponse({ status: 200, description: 'API key rolled over successfully' })
  @ApiResponse({ status: 404, description: 'API key not found' })
  @ApiBody({ type: RolloverApiKeyDto })
  async rollover(
    @Request() req,
    @Body() body: any,
  ) {
    // Validate with Zod
    const rolloverDto = new ZodValidationPipe(rolloverApiKeySchema).transform(body) as RolloverApiKeyDto;
    return this.apiKeyService.rolloverApiKey(req.user.id, rolloverDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all API keys for user' })
  @ApiResponse({ status: 200, description: 'List of API keys' })
  async findAll(@Request() req) {
    return this.apiKeyService.getUserApiKeys(req.user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke an API key' })
  @ApiResponse({ status: 200, description: 'API key revoked successfully' })
  @ApiResponse({ status: 404, description: 'API key not found' })
  async revoke(@Request() req, @Param('id') id: string) {
    return this.apiKeyService.revokeApiKey(req.user.id, id);
  }
}