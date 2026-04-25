import {
  Controller,
  Post,
  Body,
  UseGuards,
  UsePipes,
  ValidationPipe,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { MessagingService } from './messaging.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import {
  SendSingleDto,
  SendBulkDto,
  SendTextDto,
} from './dto/send-message.dto';

@ApiTags('Messaging')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
@Controller('messages')
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  @Post('send')
  @ApiOperation({ summary: 'Send a template message to a single recipient' })
  async sendSingle(@Body() dto: SendSingleDto) {
    const data = await this.messagingService.sendSingle(dto);
    return ApiResponseDto.success('Message queued successfully', data);
  }

  @Post('send-bulk')
  @ApiOperation({ summary: 'Send a template message to multiple recipients (by numbers and/or tags)' })
  async sendBulk(@Body() dto: SendBulkDto) {
    const data = await this.messagingService.sendBulk(dto);
    return ApiResponseDto.success('Bulk messages queued successfully', data);
  }

  @Post('send-bulk-csv')
  @ApiOperation({
    summary:
      'Send a template message to recipients from a CSV file (with optional contact sync)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary', description: 'CSV file with mobile column' },
        projectConfigId: { type: 'string' },
        template: { type: 'string', description: 'Template JSON (stringified)' },
        language: { type: 'string', default: 'en_US' },
        scheduledAt: { type: 'string', description: 'ISO date string (optional)' },
      },
      required: ['file', 'projectConfigId', 'template'],
    },
  })
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async sendBulkCsv(
    @UploadedFile() file: Express.Multer.File,
    @Body('projectConfigId') projectConfigId: string,
    @Body('template') templateStr: string,
    @Body('language') language?: string,
    @Body('scheduledAt') scheduledAt?: string,
  ) {
    if (!file) throw new BadRequestException('No CSV file provided');
    if (!projectConfigId)
      throw new BadRequestException('projectConfigId is required');
    if (!templateStr) throw new BadRequestException('template is required');

    if (!file.originalname.endsWith('.csv')) {
      throw new BadRequestException('Only .csv files are accepted');
    }

    let template: Record<string, any>;
    try {
      template = JSON.parse(templateStr);
    } catch {
      throw new BadRequestException('template must be valid JSON');
    }

    const data = await this.messagingService.sendBulkCsv({
      fileBuffer: file.buffer,
      projectConfigId,
      template,
      language,
      scheduledAt,
    });

    return ApiResponseDto.success('CSV broadcast queued', data);
  }

  @Post('send-text')
  @ApiOperation({ summary: 'Send a free-form text message' })
  async sendText(@Body() dto: SendTextDto) {
    const data = await this.messagingService.sendText(dto);
    return ApiResponseDto.success('Text message queued', data);
  }
}

