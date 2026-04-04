import {
  Controller,
  Post,
  Get,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Res,
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
import type { Response } from 'express';

import { ContactService } from './contact.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../user/schemas/user.schema';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import {
  CreateContactDto,
  UpdateContactDto,
  ListContactsQueryDto,
} from './dto/contact.dto';

@ApiTags('Contacts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('contacts')
export class ContactController {
  constructor(private readonly contactService: ContactService) { }

  // ─── Create Single Contact ────────────────────────────────────────────────

  @Post()
  @Roles(UserRole.MASTER, UserRole.SUPER)
  @ApiOperation({ summary: 'Create a single contact for a project' })
  async create(@Body() dto: CreateContactDto) {
    const data = await this.contactService.create(dto);
    return ApiResponseDto.success('Contact created successfully', data);
  }

  // ─── List Contacts by Project ─────────────────────────────────────────────

  @Get('project/:projectId')
  @ApiOperation({
    summary: 'List all active contacts for a project (paginated, optional tag filter)',
  })
  async listByProject(
    @Param('projectId') projectId: string,
    @Query() query: ListContactsQueryDto,
  ) {
    const data = await this.contactService.findByProject(projectId, query);
    return ApiResponseDto.success('Contacts fetched successfully', data);
  }

  // ─── Sample CSV Download ──────────────────────────────────────────────────

  @Get('sample-csv')
  @ApiOperation({
    summary: 'Download a sample CSV file showing the expected import format',
  })
  async downloadSampleCsv(@Res() res: Response) {
    const buffer = this.contactService.getSampleCsvBuffer();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="contacts_sample.csv"');
    res.send(buffer);
  }

  // ─── Import from CSV ──────────────────────────────────────────────────────

  @Post('import/csv')
  @Roles(UserRole.MASTER, UserRole.SUPER)
  @ApiOperation({
    summary:
      'Bulk import contacts from a CSV file (columns: name, mobile, tags). Tags column accepts comma-separated tag names.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary', description: 'CSV file' },
        projectId: { type: 'string', example: '6482c4adda0e29b69bfec072' },
      },
      required: ['file', 'projectId'],
    },
  })
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async importCsv(
    @UploadedFile() file: Express.Multer.File,
    @Body('projectId') projectId: string,
  ) {
    if (!file) throw new BadRequestException('No file provided');
    if (!projectId) throw new BadRequestException('projectId is required');
    if (!file.originalname.endsWith('.csv')) {
      throw new BadRequestException('Only .csv files are accepted');
    }

    const result = await this.contactService.importFromCsv(projectId, file.buffer);
    return ApiResponseDto.success('CSV import complete', result);
  }

  // ─── Get Single Contact ───────────────────────────────────────────────────

  @Get(':id')
  @ApiOperation({ summary: 'Get a single contact by ID (with attached tags)' })
  async getById(@Param('id') id: string) {
    const data = await this.contactService.findById(id);
    return ApiResponseDto.success('Contact fetched', data);
  }

  // ─── Update Contact ───────────────────────────────────────────────────────

  @Put(':id')
  @Roles(UserRole.MASTER, UserRole.SUPER)
  @ApiOperation({ summary: 'Update a contact' })
  async update(@Param('id') id: string, @Body() dto: UpdateContactDto) {
    const data = await this.contactService.update(id, dto);
    return ApiResponseDto.success('Contact updated successfully', data);
  }

  // ─── Soft Delete ──────────────────────────────────────────────────────────

  @Delete(':id')
  @Roles(UserRole.MASTER, UserRole.SUPER)
  @ApiOperation({ summary: 'Soft-delete a contact (sets isActive = false)' })
  async delete(@Param('id') id: string) {
    const data = await this.contactService.delete(id);
    return ApiResponseDto.success(data.message);
  }

  // ─── Reactivate ───────────────────────────────────────────────────────────

  @Patch(':id/reactivate')
  @Roles(UserRole.MASTER, UserRole.SUPER)
  @ApiOperation({ summary: 'Reactivate a soft-deleted contact (sets isActive = true)' })
  async reactivate(@Param('id') id: string) {
    const data = await this.contactService.reactivate(id);
    return ApiResponseDto.success(data.message, data.contact);
  }
}
