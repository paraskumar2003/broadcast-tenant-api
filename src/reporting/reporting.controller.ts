import {
  Controller,
  Get,
  Query,
  Res,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import type { Response } from 'express';
import * as ExcelJS from 'exceljs';
import { ReportingService } from './reporting.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ApiResponseDto } from '../common/dto/api-response.dto';

@ApiTags('Reporting')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportingController {
  constructor(private readonly reportingService: ReportingService) {}

  // ═══════════════════════════════════════════════════════════════════════
  // BROADCAST REPORTS
  // ═══════════════════════════════════════════════════════════════════════

  @Get('broadcasts/summary')
  @ApiOperation({ summary: 'Aggregate broadcast summary metrics' })
  @ApiQuery({ name: 'projectConfigId', required: true })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'templateName', required: false })
  @ApiQuery({ name: 'tagIds', required: false, description: 'Comma-separated tag IDs' })
  async getBroadcastSummary(
    @Query('projectConfigId') projectConfigId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: string,
    @Query('templateName') templateName?: string,
    @Query('tagIds') tagIdsStr?: string,
  ) {
    if (!projectConfigId) {
      throw new BadRequestException('projectConfigId is required');
    }

    const tagIds = tagIdsStr
      ? tagIdsStr.split(',').filter(Boolean)
      : undefined;

    const data = await this.reportingService.getBroadcastSummary({
      projectConfigId,
      startDate,
      endDate,
      status,
      templateName,
      tagIds,
    });

    return ApiResponseDto.success('Broadcast summary fetched', data);
  }

  @Get('broadcasts')
  @ApiOperation({ summary: 'Paginated broadcast list for reports table' })
  @ApiQuery({ name: 'projectConfigId', required: true })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'templateName', required: false })
  @ApiQuery({ name: 'tagIds', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getBroadcastList(
    @Query('projectConfigId') projectConfigId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: string,
    @Query('templateName') templateName?: string,
    @Query('tagIds') tagIdsStr?: string,
    @Query('search') search?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    if (!projectConfigId) {
      throw new BadRequestException('projectConfigId is required');
    }

    const tagIds = tagIdsStr
      ? tagIdsStr.split(',').filter(Boolean)
      : undefined;

    const data = await this.reportingService.getBroadcastList({
      projectConfigId,
      startDate,
      endDate,
      status,
      templateName,
      tagIds,
      search,
      page: parseInt(page, 10) || 1,
      limit: Math.min(parseInt(limit, 10) || 20, 50),
    });

    return ApiResponseDto.success('Broadcast list fetched', data);
  }

  @Get('broadcasts/export')
  @ApiOperation({ summary: 'Stream broadcast report as Excel' })
  @ApiQuery({ name: 'projectConfigId', required: true })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'templateName', required: false })
  @ApiQuery({ name: 'tagIds', required: false })
  async exportBroadcasts(
    @Query('projectConfigId') projectConfigId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: string,
    @Query('templateName') templateName?: string,
    @Query('tagIds') tagIdsStr?: string,
    @Res() res?: Response,
  ) {
    if (!projectConfigId) {
      throw new BadRequestException('projectConfigId is required');
    }

    const tagIds = tagIdsStr
      ? tagIdsStr.split(',').filter(Boolean)
      : undefined;

    res!.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res!.setHeader(
      'Content-Disposition',
      'attachment; filename=broadcast_report.xlsx',
    );

    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({ stream: res! });
    const worksheet = workbook.addWorksheet('Broadcasts');

    worksheet
      .addRow([
        'Broadcast Name',
        'Template',
        'Status',
        'Recipients',
        'Sent',
        'Delivered',
        'Failed',
        'Read',
        'Tags',
        'Scheduled At',
        'Created At',
      ])
      .commit();

    const cursor = this.reportingService.getBroadcastExportCursor({
      projectConfigId,
      startDate,
      endDate,
      status,
      templateName,
      tagIds,
    });

    for await (const doc of cursor) {
      worksheet
        .addRow([
          doc.name,
          doc.templateName,
          doc.status,
          doc.totalRecipients,
          doc.sent,
          doc.delivered,
          doc.failed,
          doc.read,
          doc.tags,
          doc.scheduledAt,
          doc.createdAt,
        ])
        .commit();
    }

    await workbook.commit();
    res!.end();
  }

  @Get('broadcasts/templates')
  @ApiOperation({ summary: 'Get distinct template names for filter dropdown' })
  @ApiQuery({ name: 'projectConfigId', required: true })
  async getDistinctTemplates(
    @Query('projectConfigId') projectConfigId: string,
  ) {
    if (!projectConfigId) {
      throw new BadRequestException('projectConfigId is required');
    }
    const data =
      await this.reportingService.getDistinctTemplates(projectConfigId);
    return ApiResponseDto.success('Templates fetched', data);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // MESSAGE-LEVEL REPORTS
  // ═══════════════════════════════════════════════════════════════════════

  @Get('messages')
  @ApiOperation({ summary: 'Paginated message-level report' })
  @ApiQuery({ name: 'projectConfigId', required: true })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'broadcastId', required: false })
  @ApiQuery({ name: 'templateName', required: false })
  @ApiQuery({ name: 'recipientNumber', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getMessageList(
    @Query('projectConfigId') projectConfigId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: string,
    @Query('broadcastId') broadcastId?: string,
    @Query('templateName') templateName?: string,
    @Query('recipientNumber') recipientNumber?: string,
    @Query('search') search?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '50',
  ) {
    if (!projectConfigId) {
      throw new BadRequestException('projectConfigId is required');
    }

    const data = await this.reportingService.getMessageList({
      projectConfigId,
      startDate,
      endDate,
      status,
      broadcastId,
      templateName,
      recipientNumber,
      search,
      page: parseInt(page, 10) || 1,
      limit: Math.min(parseInt(limit, 10) || 50, 100),
    });

    return ApiResponseDto.success('Messages fetched', data);
  }

  @Get('messages/export')
  @ApiOperation({ summary: 'Stream message-level report as Excel' })
  @ApiQuery({ name: 'projectConfigId', required: true })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'broadcastId', required: false })
  @ApiQuery({ name: 'templateName', required: false })
  @ApiQuery({ name: 'recipientNumber', required: false })
  async exportMessages(
    @Query('projectConfigId') projectConfigId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: string,
    @Query('broadcastId') broadcastId?: string,
    @Query('templateName') templateName?: string,
    @Query('recipientNumber') recipientNumber?: string,
    @Res() res?: Response,
  ) {
    if (!projectConfigId) {
      throw new BadRequestException('projectConfigId is required');
    }

    res!.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res!.setHeader(
      'Content-Disposition',
      'attachment; filename=message_report.xlsx',
    );

    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({ stream: res! });
    const worksheet = workbook.addWorksheet('Messages');

    worksheet
      .addRow([
        'Recipient Number',
        'Broadcast',
        'Template',
        'Status',
        'Error',
        'Created At',
      ])
      .commit();

    const cursor = this.reportingService.getMessageExportCursor({
      projectConfigId,
      startDate,
      endDate,
      status,
      broadcastId,
      templateName,
      recipientNumber,
    });

    for await (const doc of cursor) {
      worksheet
        .addRow([
          doc.recipientNumber,
          doc.broadcastName || '—',
          doc.templateName || '—',
          doc.currentStatus,
          doc.errorDetails?.title || doc.errorDetails?.message || '',
          doc.createdAt,
        ])
        .commit();
    }

    await workbook.commit();
    res!.end();
  }
}
