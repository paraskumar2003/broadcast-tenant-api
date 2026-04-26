import { Controller, Post, Body, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import type { Response } from 'express';
import { ReportingService } from './reporting.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import * as ExcelJS from 'exceljs';

@ApiTags('Reporting')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportingController {
  constructor(private readonly reportingService: ReportingService) {}

  @Post('messages')
  @ApiOperation({ summary: 'Paginated message list with delivery events' })
  async getMessages(
    @Body()
    body: {
      date?: string;
      number?: string;
      sessionId?: string;
      page?: number;
      limit?: number;
    },
  ) {
    const data = await this.reportingService.getMessages(body);
    return ApiResponseDto.success('Messages fetched', data);
  }

  @Post('sessions')
  @ApiOperation({ summary: 'Session-level summary with counters' })
  async getSessionSummary(
    @Body()
    body: {
      date?: string;
      projectConfigId?: string;
      page?: number;
      limit?: number;
    },
  ) {
    const data = await this.reportingService.getSessionSummary(body);
    return ApiResponseDto.success('Session summary fetched', data);
  }

  @Post('analytics')
  @ApiOperation({ summary: 'Aggregated analytics by template and date range' })
  async getAnalytics(
    @Body()
    body: {
      startDate: string;
      endDate: string;
      wabaId?: string;
      templateName?: string;
    },
  ) {
    const data = await this.reportingService.getAnalytics(body);
    return ApiResponseDto.success('Analytics fetched', data);
  }

  @Post('export')
  @ApiOperation({ summary: 'Stream Excel export of messages' })
  async exportExcel(
    @Body()
    body: {
      date: string;
      wabaId?: string;
      templateName?: string;
      status?: string;
    },
    @Res() res: Response,
  ) {
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', 'attachment; filename=messages.xlsx');

    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({ stream: res });
    const worksheet = workbook.addWorksheet('Messages');

    worksheet
      .addRow(['Template', 'Number', 'Message ID', 'Status', 'Timestamp'])
      .commit();

    const cursor = this.reportingService.getExcelCursor(body);

    for await (const doc of cursor) {
      worksheet
        .addRow([
          doc.templateName,
          doc.recipientNumber,
          doc.metaMessageId,
          doc.status,
          doc.timestamp,
        ])
        .commit();
    }

    await workbook.commit();
    res.end();
  }
}
