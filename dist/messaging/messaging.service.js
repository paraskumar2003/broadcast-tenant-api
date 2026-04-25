"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var MessagingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagingService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const sync_1 = require("csv-parse/sync");
const message_session_schema_1 = require("./schemas/message-session.schema");
const broadcast_schema_1 = require("./schemas/broadcast.schema");
const message_schema_1 = require("./schemas/message.schema");
const contact_schema_1 = require("../contact/schemas/contact.schema");
const contact_tagging_schema_1 = require("../tagging/schemas/contact-tagging.schema");
const tag_schema_1 = require("../tagging/schemas/tag.schema");
const project_service_1 = require("../project/project.service");
const queue_interface_1 = require("../queue/queue.interface");
let MessagingService = MessagingService_1 = class MessagingService {
    sessionModel;
    broadcastModel;
    messageModel;
    contactModel;
    contactTaggingModel;
    tagModel;
    queueService;
    projectService;
    logger = new common_1.Logger(MessagingService_1.name);
    constructor(sessionModel, broadcastModel, messageModel, contactModel, contactTaggingModel, tagModel, queueService, projectService) {
        this.sessionModel = sessionModel;
        this.broadcastModel = broadcastModel;
        this.messageModel = messageModel;
        this.contactModel = contactModel;
        this.contactTaggingModel = contactTaggingModel;
        this.tagModel = tagModel;
        this.queueService = queueService;
        this.projectService = projectService;
    }
    generateBroadcastName() {
        const now = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        return `Broadcast ${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    }
    async sendSingle(dto) {
        const projId = new mongoose_2.Types.ObjectId(dto.projectConfigId);
        const skip = dto.skipBroadcast === true;
        let broadcastId = null;
        let sessionId = null;
        if (!skip) {
            const broadcast = await this.broadcastModel.create({
                projectConfigId: projId,
                name: dto.broadcastName?.trim() || this.generateBroadcastName(),
                templateName: dto.template.name,
                templatePayload: dto.template,
                language: dto.language || 'en_US',
                totalRecipients: 1,
                status: 'processing',
                scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
            });
            broadcastId = broadcast._id;
            const session = await this.sessionModel.create({
                projectConfigId: projId,
                templateName: dto.template.name,
                templatePayload: dto.template,
                language: dto.language || 'en_US',
                totalRecipients: 1,
                status: 'processing',
                scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
            });
            sessionId = session._id;
        }
        const message = await this.messageModel.create({
            sessionId,
            broadcastId,
            projectConfigId: projId,
            recipientNumber: dto.number,
            templateName: dto.template.name,
            language: dto.language || 'en_US',
            currentStatus: 'queued',
            statusHistory: [{ status: 'queued', timestamp: new Date() }],
        });
        if (sessionId) {
            await this.sessionModel.updateOne({ _id: sessionId }, { $inc: { 'counters.queued': 1 } });
        }
        if (broadcastId) {
            await this.broadcastModel.updateOne({ _id: broadcastId }, { $inc: { 'counters.queued': 1 } });
        }
        const delayMs = dto.scheduledAt
            ? new Date(dto.scheduledAt).getTime() - Date.now()
            : undefined;
        const payload = {
            messageId: message._id.toString(),
            sessionId: sessionId?.toString() || '',
            broadcastId: broadcastId?.toString() || '',
            projectConfigId: dto.projectConfigId,
            recipientNumber: dto.number,
            templateName: dto.template.name,
            templateComponents: dto.template.components || [],
            params: dto.params || {},
            language: dto.language || 'en_US',
            type: 'template',
        };
        await this.queueService.publish(queue_interface_1.QUEUE_NAMES.MESSAGE_SEND, payload, {
            delayMs: delayMs && delayMs > 0 ? delayMs : undefined,
        });
        return {
            ...(broadcastId ? { broadcastId } : {}),
            ...(sessionId ? { sessionId } : {}),
            messageId: message._id,
        };
    }
    async sendBulk(dto) {
        const hasRecipients = dto.recipients && dto.recipients.length > 0;
        const hasTags = dto.tagIds && dto.tagIds.length > 0;
        if (!hasRecipients && !hasTags) {
            throw new common_1.BadRequestException('At least one of "recipients" or "tagIds" must be provided.');
        }
        const recipientMap = new Map();
        if (hasRecipients) {
            for (const r of dto.recipients) {
                const mobile = r.number.replace(/\s+/g, '');
                if (!recipientMap.has(mobile)) {
                    recipientMap.set(mobile, { number: mobile, params: r.params || {} });
                }
            }
        }
        if (hasTags) {
            const tagObjectIds = dto.tagIds.map((id) => new mongoose_2.Types.ObjectId(id));
            const taggings = await this.contactTaggingModel.find({
                tagId: { $in: tagObjectIds },
            });
            const uniqueContactIds = [
                ...new Set(taggings.map((t) => t.contactId.toString())),
            ].map((id) => new mongoose_2.Types.ObjectId(id));
            if (uniqueContactIds.length > 0) {
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
            throw new common_1.BadRequestException('No active contacts found for the provided tags/recipients.');
        }
        this.logger.log(`send-bulk: ${finalRecipients.length} unique recipients (explicit: ${dto.recipients?.length ?? 0}, tags: ${dto.tagIds?.length ?? 0})`);
        const projId = new mongoose_2.Types.ObjectId(dto.projectConfigId);
        const skip = dto.skipBroadcast === true;
        let broadcastId = null;
        let sessionId = null;
        if (!skip) {
            const broadcast = await this.broadcastModel.create({
                projectConfigId: projId,
                name: dto.broadcastName?.trim() || this.generateBroadcastName(),
                templateName: dto.template.name,
                templatePayload: dto.template,
                language: dto.language || 'en_US',
                totalRecipients: finalRecipients.length,
                status: 'processing',
                scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
            });
            broadcastId = broadcast._id;
        }
        const session = await this.sessionModel.create({
            projectConfigId: projId,
            templateName: dto.template.name,
            templatePayload: dto.template,
            language: dto.language || 'en_US',
            totalRecipients: finalRecipients.length,
            status: 'processing',
            scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
        });
        sessionId = session._id;
        const delayMs = dto.scheduledAt
            ? new Date(dto.scheduledAt).getTime() - Date.now()
            : undefined;
        const messages = await this.messageModel.insertMany(finalRecipients.map((r) => ({
            sessionId,
            broadcastId,
            projectConfigId: projId,
            recipientNumber: r.number,
            templateName: dto.template.name,
            language: dto.language || 'en_US',
            currentStatus: 'queued',
            statusHistory: [{ status: 'queued', timestamp: new Date() }],
        })));
        await this.sessionModel.updateOne({ _id: sessionId }, { $inc: { 'counters.queued': messages.length } });
        if (broadcastId) {
            await this.broadcastModel.updateOne({ _id: broadcastId }, { $inc: { 'counters.queued': messages.length } });
        }
        const queueItems = messages.map((msg, idx) => ({
            data: {
                messageId: msg._id.toString(),
                sessionId: sessionId.toString(),
                broadcastId: broadcastId?.toString() || '',
                projectConfigId: dto.projectConfigId,
                recipientNumber: finalRecipients[idx].number,
                templateName: dto.template.name,
                templateComponents: dto.template.components || [],
                params: finalRecipients[idx].params || {},
                language: dto.language || 'en_US',
                type: 'template',
            },
            options: {
                delayMs: delayMs && delayMs > 0 ? delayMs : undefined,
            },
        }));
        await this.queueService.publishBulk(queue_interface_1.QUEUE_NAMES.MESSAGE_SEND, queueItems);
        return {
            ...(broadcastId ? { broadcastId } : {}),
            sessionId,
            totalQueued: messages.length,
        };
    }
    async sendText(dto) {
        const payload = {
            messageId: '',
            sessionId: '',
            broadcastId: '',
            projectConfigId: dto.projectConfigId,
            recipientNumber: dto.number,
            templateName: '',
            templateComponents: [],
            params: {},
            language: 'en_US',
            type: 'text',
            text: dto.text,
        };
        await this.queueService.publish(queue_interface_1.QUEUE_NAMES.MESSAGE_SEND, payload);
        return { status: true, message: 'Text message queued' };
    }
    async sendBulkCsv(opts) {
        const { fileBuffer, projectConfigId, template, language, scheduledAt, skipBroadcast, broadcastName, } = opts;
        const projId = new mongoose_2.Types.ObjectId(projectConfigId);
        const records = (0, sync_1.parse)(fileBuffer, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
        });
        if (records.length === 0) {
            throw new common_1.BadRequestException('CSV file contains no data rows.');
        }
        const headers = Object.keys(records[0]).map((h) => h.toLowerCase().trim());
        const rawHeaders = Object.keys(records[0]);
        const mobileIdx = headers.findIndex((h) => h === 'mobile' || h === 'phone' || h === 'number');
        if (mobileIdx === -1) {
            throw new common_1.BadRequestException('CSV must contain a "mobile", "phone", or "number" column.');
        }
        const mobileKey = rawHeaders[mobileIdx];
        const hasName = headers.includes('name');
        const hasTags = headers.includes('tags');
        const nameKey = hasName ? rawHeaders[headers.indexOf('name')] : null;
        const tagsKey = hasTags ? rawHeaders[headers.indexOf('tags')] : null;
        const tagCache = new Map();
        const getTagId = async (tagName) => {
            const key = tagName.toLowerCase().trim();
            if (!key)
                return null;
            if (tagCache.has(key))
                return tagCache.get(key);
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
            tagCache.set(key, tag._id);
            return tag._id;
        };
        const recipientMap = new Map();
        let contactsSynced = 0;
        for (const row of records) {
            const rawMobile = row[mobileKey]?.trim();
            if (!rawMobile)
                continue;
            const mobile = rawMobile.replace(/\s+/g, '');
            if (hasName || hasTags) {
                const contactName = nameKey ? row[nameKey]?.trim() : undefined;
                try {
                    const contact = await this.contactModel.findOneAndUpdate({ projectId: projId, mobile }, {
                        $set: {
                            ...(contactName ? { name: contactName } : {}),
                        },
                        $setOnInsert: {
                            projectId: projId,
                            mobile,
                            isActive: true,
                            ...(contactName ? {} : { name: 'Unknown User' }),
                        },
                    }, { upsert: true, new: true });
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
                                }
                                catch (err) {
                                    if (err.code !== 11000)
                                        throw err;
                                }
                            }
                        }
                    }
                    contactsSynced++;
                }
                catch (err) {
                    this.logger.warn(`Contact sync failed for ${mobile}: ${err.message}`);
                }
            }
            if (!recipientMap.has(mobile)) {
                const params = {};
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
            throw new common_1.BadRequestException('No valid mobile numbers found in CSV.');
        }
        this.logger.log(`send-bulk-csv: ${finalRecipients.length} unique recipients, ${contactsSynced} contacts synced`);
        const skip = skipBroadcast === true;
        let broadcastId = null;
        if (!skip) {
            const broadcast = await this.broadcastModel.create({
                projectConfigId: projId,
                name: broadcastName?.trim() || this.generateBroadcastName(),
                templateName: template.name,
                templatePayload: template,
                language: language || 'en_US',
                totalRecipients: finalRecipients.length,
                status: 'processing',
                scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
            });
            broadcastId = broadcast._id;
        }
        const session = await this.sessionModel.create({
            projectConfigId: projId,
            templateName: template.name,
            templatePayload: template,
            language: language || 'en_US',
            totalRecipients: finalRecipients.length,
            status: 'processing',
            scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        });
        const sessionId = session._id;
        const delayMs = scheduledAt
            ? new Date(scheduledAt).getTime() - Date.now()
            : undefined;
        const messages = await this.messageModel.insertMany(finalRecipients.map((r) => ({
            sessionId,
            broadcastId,
            projectConfigId: projId,
            recipientNumber: r.number,
            templateName: template.name,
            language: language || 'en_US',
            currentStatus: 'queued',
            statusHistory: [{ status: 'queued', timestamp: new Date() }],
        })));
        await this.sessionModel.updateOne({ _id: sessionId }, { $inc: { 'counters.queued': messages.length } });
        if (broadcastId) {
            await this.broadcastModel.updateOne({ _id: broadcastId }, { $inc: { 'counters.queued': messages.length } });
        }
        const queueItems = messages.map((msg, idx) => ({
            data: {
                messageId: msg._id.toString(),
                sessionId: sessionId.toString(),
                broadcastId: broadcastId?.toString() || '',
                projectConfigId,
                recipientNumber: finalRecipients[idx].number,
                templateName: template.name,
                templateComponents: template.components || [],
                params: finalRecipients[idx].params || {},
                language: language || 'en_US',
                type: 'template',
            },
            options: {
                delayMs: delayMs && delayMs > 0 ? delayMs : undefined,
            },
        }));
        await this.queueService.publishBulk(queue_interface_1.QUEUE_NAMES.MESSAGE_SEND, queueItems);
        return {
            ...(broadcastId ? { broadcastId } : {}),
            sessionId,
            totalQueued: messages.length,
            contactsSynced,
        };
    }
    async listBroadcasts(projectConfigId, page, limit) {
        const projId = new mongoose_2.Types.ObjectId(projectConfigId);
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.broadcastModel
                .find({ projectConfigId: projId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            this.broadcastModel.countDocuments({ projectConfigId: projId }),
        ]);
        return {
            data: data.map((b) => ({
                id: b._id,
                name: b.name,
                templateName: b.templateName,
                status: b.status,
                recipientsCount: b.totalRecipients,
                counters: b.counters,
                deliveredPercentage: b.totalRecipients > 0
                    ? Math.round((b.counters.delivered / b.totalRecipients) * 1000) / 10
                    : 0,
                scheduledAt: b.scheduledAt,
                createdAt: b.createdAt,
            })),
            pagination: {
                page,
                limit,
                total,
                hasNext: skip + limit < total,
            },
        };
    }
};
exports.MessagingService = MessagingService;
exports.MessagingService = MessagingService = MessagingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(message_session_schema_1.MessageSession.name)),
    __param(1, (0, mongoose_1.InjectModel)(broadcast_schema_1.Broadcast.name)),
    __param(2, (0, mongoose_1.InjectModel)(message_schema_1.Message.name)),
    __param(3, (0, mongoose_1.InjectModel)(contact_schema_1.Contact.name)),
    __param(4, (0, mongoose_1.InjectModel)(contact_tagging_schema_1.ContactTagging.name)),
    __param(5, (0, mongoose_1.InjectModel)(tag_schema_1.Tag.name)),
    __param(6, (0, common_1.Inject)(queue_interface_1.QUEUE_SERVICE)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model, Object, project_service_1.ProjectService])
], MessagingService);
//# sourceMappingURL=messaging.service.js.map