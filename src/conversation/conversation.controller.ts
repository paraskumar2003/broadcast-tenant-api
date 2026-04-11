import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ConversationService } from './conversation.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../user/schemas/user.schema';
import { ApiResponseDto } from '../common/dto/api-response.dto';

class ReplyDto {
  @ApiProperty({ example: 'Your order has been shipped!', description: 'Text message to send' })
  @IsString()
  @IsNotEmpty()
  text: string;
}

@ApiTags('Conversations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('conversations')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  // ─── List Conversations for a Project ────────────────────────────────

  @Get('project/:projectId')
  @ApiOperation({
    summary: 'List conversations for a project (paginated, for chat UI)',
  })
  @ApiQuery({ name: 'status', required: false, enum: ['open', 'closed'] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async listConversations(
    @Param('projectId') projectId: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const data = await this.conversationService.listConversations(
      projectId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
      status,
    );
    return ApiResponseDto.success('Conversations fetched', data);
  }

  // ─── Reply to a Conversation ─────────────────────────────────────────

  @Post(':id/reply')
  @Roles(UserRole.MASTER, UserRole.SUPER)
  @ApiOperation({
    summary:
      'Send a free-form text reply within an active conversation window',
  })
  async reply(@Param('id') id: string, @Body() dto: ReplyDto) {
    const data = await this.conversationService.sendReply(id, dto.text);
    return ApiResponseDto.success('Reply queued', data);
  }

  // ─── Get Messages for a Conversation ──────────────────────────────────

  @Get(':id/messages')
  @ApiOperation({
    summary: 'Get paginated messages for a conversation (sorted ascending)',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getMessages(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const data = await this.conversationService.getMessages(
      id,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 50,
    );
    return ApiResponseDto.success('Messages fetched', data);
  }

  // ─── Get Single Conversation ──────────────────────────────────────────

  @Get(':id')
  @ApiOperation({ summary: 'Get a single conversation with contact details' })
  async getConversation(@Param('id') id: string) {
    const data = await this.conversationService.getConversation(id);
    return ApiResponseDto.success('Conversation fetched', data);
  }
}

