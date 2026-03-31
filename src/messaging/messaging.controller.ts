import {
  Controller,
  Post,
  Body,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'Send a template message to multiple recipients' })
  async sendBulk(@Body() dto: SendBulkDto) {
    const data = await this.messagingService.sendBulk(dto);
    return ApiResponseDto.success('Bulk messages queued successfully', data);
  }

  @Post('send-text')
  @ApiOperation({ summary: 'Send a free-form text message' })
  async sendText(@Body() dto: SendTextDto) {
    const data = await this.messagingService.sendText(dto);
    return ApiResponseDto.success('Text message queued', data);
  }
}
