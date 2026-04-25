import {
  Injectable,
  Logger,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { parse } from 'csv-parse/sync';
import {
  MessageSession,
  MessageSessionDocument,
} from './schemas/message-session.schema';
import { Message, MessageDocument } from './schemas/message.schema';
import { Contact, ContactDocument } from '../contact/schemas/contact.schema';
import {
  ContactTagging,
  ContactTaggingDocument,
} from '../tagging/schemas/contact-tagging.schema';
import { Tag, TagDocument } from '../tagging/schemas/tag.schema';
import { ProjectService } from '../project/project.service';
import type { IQueueService } from '../queue/queue.interface';
import { QUEUE_SERVICE, QUEUE_NAMES } from '../queue/queue.interface';
import {
  SendSingleDto,
  SendBulkDto,
  SendTextDto,
} from './dto/send-message.dto';

export interface MessageJobPayload {
  messageId: string;
  sessionId: string;
  projectConfigId: string;
  recipientNumber: string;
  templateName: string;
  templateComponents: any[];
  params: Record<string, any>;
  language: string;
  type: 'template' | 'text' | 'image' | 'video' | 'audio' | 'document';
  text?: string;
  mediaUrl?: string;
  fileName?: string;
}

@Injectable()
export class MessagingService {
  private readonly logger = new Logger(MessagingService.name);

  constructor(
    @InjectModel(MessageSession.name)
    private sessionModel: Model<MessageSessionDocument>,
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @InjectModel(Contact.name) private contactModel: Model<ContactDocument>,
    @InjectModel(ContactTagging.name)
    private contactTaggingModel: Model<ContactTaggingDocument>,
    @InjectModel(Tag.name)
    private tagModel: Model<TagDocument>,
    @Inject(QUEUE_SERVICE) private readonly queueService: IQueueService,
    private readonly projectService: ProjectService,
  ) {}

  /**
   * Send a template message to a single recipient.
   */
  async sendSingle(dto: SendSingleDto) {
    const session = await this.sessionModel.create({
      projectConfigId: new Types.ObjectId(dto.projectConfigId),
      templateName: dto.template.name,
      templatePayload: dto.template,
      language: dto.language || 'en_US',
      totalRecipients: 1,
      status: 'processing',
      scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
    });

    const message = await this.messageModel.create({
      sessionId: session._id,
      projectConfigId: new Types.ObjectId(dto.projectConfigId),
      recipientNumber: dto.number,
      templateName: dto.template.name,
      language: dto.language || 'en_US',
      currentStatus: 'queued',
      statusHistory: [{ status: 'queued', timestamp: new Date() }],
    });

    await this.sessionModel.updateOne(
      { _id: session._id },
      { $inc: { 'counters.queued': 1 } },
    );

    const payload: MessageJobPayload = {
      messageId: message._id.toString(),
      sessionId: session._id.toString(),
      projectConfigId: dto.projectConfigId,
      recipientNumber: dto.number,
      templateName: dto.template.name,
      templateComponents: dto.template.components || [],
      params: dto.params || {},
      language: dto.language || 'en_US',
      type: 'template',
    };

    const delayMs = dto.scheduledAt
      ? new Date(dto.scheduledAt).getTime() - Date.now()
      : undefined;

    await this.queueService.publish(QUEUE_NAMES.MESSAGE_SEND, payload, {
      delayMs: delayMs && delayMs > 0 ? delayMs : undefined,
    });

    return { sessionId: session._id, messageId: message._id };
  }

  /**
   * Send a template message to multiple recipients.
   * Supports explicit recipients, tag-based resolution, or both.
   * Contacts appearing in multiple tags or in both lists are deduplicated by mobile number.
   */
  async sendBulk(dto: SendBulkDto) {
    const hasRecipients = dto.recipients && dto.recipients.length > 0;
    const hasTags = dto.tagIds && dto.tagIds.length > 0;

    if (!hasRecipients && !hasTags) {
      throw new BadRequestException(
        'At least one of "recipients" or "tagIds" must be provided.',
      );
    }

    // ─── Build deduplicated recipient list ──────────────────────────────
    // Map: mobile → { number, params }
    const recipientMap = new Map<
      string,
      { number: string; params: Record<string, any> }
    >();

    // 1. Add explicit recipients
    if (hasRecipients) {
      for (const r of dto.recipients!) {
        const mobile = r.number.replace(/\s+/g, '');
        if (!recipientMap.has(mobile)) {
          recipientMap.set(mobile, { number: mobile, params: r.params || {} });
        }
      }
    }

    // 2. Resolve contacts from tags
    if (hasTags) {
      const tagObjectIds = dto.tagIds!.map((id) => new Types.ObjectId(id));

      // Find unique contactIds across all provided tags
      const taggings = await this.contactTaggingModel.find({
        tagId: { $in: tagObjectIds },
      });

      const uniqueContactIds = [
        ...new Set(taggings.map((t) => t.contactId.toString())),
      ].map((id) => new Types.ObjectId(id));

      if (uniqueContactIds.length > 0) {
        // Fetch only active contacts
        const contacts = await this.contactModel.find({
          _id: { $in: uniqueContactIds },
          isActive: true,
        });

        for (const contact of contacts) {
          const mobile = contact.mobile.replace(/\s+/g, '');
          if (!recipientMap.has(mobile)) {
            recipientMap.set(mobile, {
              number: mobile,
              params: dto.params || {},
            });
          }
        }
      }
    }

    const finalRecipients = Array.from(recipientMap.values());

    if (finalRecipients.length === 0) {
      throw new BadRequestException(
        'No active contacts found for the provided tags/recipients.',
      );
    }

    this.logger.log(
      `send-bulk: ${finalRecipients.length} unique recipients (explicit: ${dto.recipients?.length ?? 0}, tags: ${dto.tagIds?.length ?? 0})`,
    );

    // ─── Create session and messages ────────────────────────────────────
    const session = await this.sessionModel.create({
      projectConfigId: new Types.ObjectId(dto.projectConfigId),
      templateName: dto.template.name,
      templatePayload: dto.template,
      language: dto.language || 'en_US',
      totalRecipients: finalRecipients.length,
      status: 'processing',
      scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
    });

    const delayMs = dto.scheduledAt
      ? new Date(dto.scheduledAt).getTime() - Date.now()
      : undefined;

    const messages = await this.messageModel.insertMany(
      finalRecipients.map((r) => ({
        sessionId: session._id,
        projectConfigId: new Types.ObjectId(dto.projectConfigId),
        recipientNumber: r.number,
        templateName: dto.template.name,
        language: dto.language || 'en_US',
        currentStatus: 'queued',
        statusHistory: [{ status: 'queued', timestamp: new Date() }],
      })),
    );

    await this.sessionModel.updateOne(
      { _id: session._id },
      { $inc: { 'counters.queued': messages.length } },
    );

    const queueItems = messages.map((msg, idx) => ({
      data: {
        messageId: msg._id.toString(),
        sessionId: session._id.toString(),
        projectConfigId: dto.projectConfigId,
        recipientNumber: finalRecipients[idx].number,
        templateName: dto.template.name,
        templateComponents: dto.template.components || [],
        params: finalRecipients[idx].params || {},
        language: dto.language || 'en_US',
        type: 'template' as const,
      },
      options: {
        delayMs: delayMs && delayMs > 0 ? delayMs : undefined,
      },
    }));

    await this.queueService.publishBulk(QUEUE_NAMES.MESSAGE_SEND, queueItems);

    return {
      sessionId: session._id,
      totalQueued: messages.length,
    };
  }

  /**
   * Send a free-form text message (no queue, immediate).
   */
  async sendText(dto: SendTextDto) {
    const payload: MessageJobPayload = {
      messageId: '',
      sessionId: '',
      projectConfigId: dto.projectConfigId,
      recipientNumber: dto.number,
      templateName: '',
      templateComponents: [],
      params: {},
      language: 'en_US',
      type: 'text',
      text: dto.text,
    };

    await this.queueService.publish(QUEUE_NAMES.MESSAGE_SEND, payload);

    return { status: true, message: 'Text message queued' };
  }

  /**
   * Send a template message to recipients from a CSV file.
   * Optionally syncs contacts if name/tags columns are present.
   */
  async sendBulkCsv(opts: {
    fileBuffer: Buffer;
    projectConfigId: string;
    template: Record<string, any>;
    language?: string;
    scheduledAt?: string;
  }) {
    const { fileBuffer, projectConfigId, template, language, scheduledAt } =
      opts;
    const projId = new Types.ObjectId(projectConfigId);

    // 1. Parse CSV
    const records: Record<string, string>[] = parse(fileBuffer, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    if (records.length === 0) {
      throw new BadRequestException('CSV file contains no data rows.');
    }

    const headers = Object.keys(records[0]).map((h) => h.toLowerCase().trim());
    const rawHeaders = Object.keys(records[0]); // preserve original case for value lookup

    // 2. Find mobile column
    const mobileIdx = headers.findIndex(
      (h) => h === 'mobile' || h === 'phone' || h === 'number',
    );
    if (mobileIdx === -1) {
      throw new BadRequestException(
        'CSV must contain a "mobile", "phone", or "number" column.',
      );
    }
    const mobileKey = rawHeaders[mobileIdx];

    const hasName = headers.includes('name');
    const hasTags = headers.includes('tags');
    const nameKey = hasName ? rawHeaders[headers.indexOf('name')] : null;
    const tagsKey = hasTags ? rawHeaders[headers.indexOf('tags')] : null;

    // 3. Process rows — sync contacts + collect recipients
    const tagCache = new Map<string, Types.ObjectId>();
    const getTagId = async (
      tagName: string,
    ): Promise<Types.ObjectId | null> => {
      const key = tagName.toLowerCase().trim();
      if (!key) return null;
      if (tagCache.has(key)) return tagCache.get(key)!;

      let tag = await this.tagModel.findOne({
        projectId: projId,
        name: { $regex: new RegExp(`^${key}$`, 'i') },
      });
      if (!tag) {
        tag = await this.tagModel.create({
          projectId: projId,
          name: tagName.trim(),
          color: '#3B82F6',
        });
      }
      tagCache.set(key, tag._id as Types.ObjectId);
      return tag._id as Types.ObjectId;
    };

    // Deduplicate + build per-row params
    // Map: mobile -> { number, params (all extra columns as key-value) }
    const recipientMap = new Map<
      string,
      { number: string; params: Record<string, string> }
    >();
    let contactsSynced = 0;

    for (const row of records) {
      const rawMobile = row[mobileKey]?.trim();
      if (!rawMobile) continue;
      const mobile = rawMobile.replace(/\s+/g, '');

      // Sync contact if name or tags column exists
      if (hasName || hasTags) {
        const contactName = nameKey ? row[nameKey]?.trim() : undefined;

        try {
          const contact = await this.contactModel.findOneAndUpdate(
            { projectId: projId, mobile },
            {
              $set: {
                ...(contactName ? { name: contactName } : {}),
              },
              $setOnInsert: {
                projectId: projId,
                mobile,
                isActive: true,
                ...(contactName ? {} : { name: 'Unknown User' }),
              },
            },
            { upsert: true, new: true },
          );

          // Attach tags
          if (tagsKey && row[tagsKey]) {
            const tagNames = row[tagsKey]
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean);
            for (const tn of tagNames) {
              const tagId = await getTagId(tn);
              if (tagId) {
                try {
                  await this.contactTaggingModel.create({
                    projectId: projId,
                    tagId,
                    contactId: contact._id,
                  });
                } catch (err: any) {
                  if (err.code !== 11000) throw err; // ignore duplicate
                }
              }
            }
          }

          contactsSynced++;
        } catch (err: any) {
          this.logger.warn(`Contact sync failed for ${mobile}: ${err.message}`);
        }
      }

      // Collect recipient with all CSV columns as params
      if (!recipientMap.has(mobile)) {
        const params: Record<string, string> = {};
        for (const h of rawHeaders) {
          const key = h.toLowerCase().trim();
          if (key !== 'mobile' && key !== 'phone' && key !== 'number') {
            params[h] = row[h] || '';
          }
        }
        recipientMap.set(mobile, { number: mobile, params });
      }
    }

    const finalRecipients = Array.from(recipientMap.values());

    if (finalRecipients.length === 0) {
      throw new BadRequestException('No valid mobile numbers found in CSV.');
    }

    this.logger.log(
      `send-bulk-csv: ${finalRecipients.length} unique recipients, ${contactsSynced} contacts synced`,
    );

    // 4. Create session + messages
    const session = await this.sessionModel.create({
      projectConfigId: projId,
      templateName: template.name,
      templatePayload: template,
      language: language || 'en_US',
      totalRecipients: finalRecipients.length,
      status: 'processing',
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
    });

    const delayMs = scheduledAt
      ? new Date(scheduledAt).getTime() - Date.now()
      : undefined;

    const messages = await this.messageModel.insertMany(
      finalRecipients.map((r) => ({
        sessionId: session._id,
        projectConfigId: projId,
        recipientNumber: r.number,
        templateName: template.name,
        language: language || 'en_US',
        currentStatus: 'queued',
        statusHistory: [{ status: 'queued', timestamp: new Date() }],
      })),
    );

    await this.sessionModel.updateOne(
      { _id: session._id },
      { $inc: { 'counters.queued': messages.length } },
    );

    const queueItems = messages.map((msg, idx) => ({
      data: {
        messageId: msg._id.toString(),
        sessionId: session._id.toString(),
        projectConfigId,
        recipientNumber: finalRecipients[idx].number,
        templateName: template.name,
        templateComponents: template.components || [],
        params: finalRecipients[idx].params || {},
        language: language || 'en_US',
        type: 'template' as const,
      },
      options: {
        delayMs: delayMs && delayMs > 0 ? delayMs : undefined,
      },
    }));

    await this.queueService.publishBulk(QUEUE_NAMES.MESSAGE_SEND, queueItems);

    return {
      sessionId: session._id,
      totalQueued: messages.length,
      contactsSynced,
    };
  }
}
