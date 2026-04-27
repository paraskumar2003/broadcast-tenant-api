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
var ReportingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportingService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const message_schema_1 = require("../messaging/schemas/message.schema");
const broadcast_schema_1 = require("../messaging/schemas/broadcast.schema");
const tag_schema_1 = require("../tagging/schemas/tag.schema");
let ReportingService = ReportingService_1 = class ReportingService {
    messageModel;
    broadcastModel;
    tagModel;
    logger = new common_1.Logger(ReportingService_1.name);
    constructor(messageModel, broadcastModel, tagModel) {
        this.messageModel = messageModel;
        this.broadcastModel = broadcastModel;
        this.tagModel = tagModel;
    }
    buildDateRange(startDate, endDate) {
        const now = new Date();
        const end = endDate ? new Date(endDate) : now;
        end.setHours(23, 59, 59, 999);
        const start = startDate
            ? new Date(startDate)
            : new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        start.setHours(0, 0, 0, 0);
        const maxMs = 90 * 24 * 60 * 60 * 1000;
        if (end.getTime() - start.getTime() > maxMs) {
            throw new common_1.BadRequestException('Date range cannot exceed 90 days.');
        }
        return { $gte: start, $lte: end };
    }
    buildBroadcastMatch(filters) {
        const match = {
            projectConfigId: new mongoose_2.Types.ObjectId(filters.projectConfigId),
            createdAt: this.buildDateRange(filters.startDate, filters.endDate),
        };
        if (filters.status && filters.status !== 'all') {
            match.status = filters.status;
        }
        if (filters.templateName && filters.templateName !== 'all') {
            match.templateName = filters.templateName;
        }
        if (filters.tagIds && filters.tagIds.length > 0) {
            match.tagIds = {
                $in: filters.tagIds.map((id) => new mongoose_2.Types.ObjectId(id)),
            };
        }
        if (filters.search) {
            match.name = { $regex: filters.search, $options: 'i' };
        }
        return match;
    }
    async getBroadcastSummary(filters) {
        const match = this.buildBroadcastMatch(filters);
        const pipeline = [
            { $match: match },
            {
                $group: {
                    _id: null,
                    totalBroadcasts: { $sum: 1 },
                    totalRecipients: { $sum: '$totalRecipients' },
                    totalSent: { $sum: '$counters.sent' },
                    totalDelivered: { $sum: '$counters.delivered' },
                    totalFailed: { $sum: '$counters.failed' },
                    totalRead: { $sum: '$counters.read' },
                },
            },
        ];
        const [result] = await this.broadcastModel.aggregate(pipeline);
        if (!result) {
            return {
                totalBroadcasts: 0,
                totalRecipients: 0,
                totalSent: 0,
                totalDelivered: 0,
                totalFailed: 0,
                totalRead: 0,
                deliveryRate: 0,
                readRate: 0,
            };
        }
        return {
            totalBroadcasts: result.totalBroadcasts,
            totalRecipients: result.totalRecipients,
            totalSent: result.totalSent,
            totalDelivered: result.totalDelivered,
            totalFailed: result.totalFailed,
            totalRead: result.totalRead,
            deliveryRate: result.totalSent > 0
                ? Math.round((result.totalDelivered / result.totalSent) * 1000) / 10
                : 0,
            readRate: result.totalDelivered > 0
                ? Math.round((result.totalRead / result.totalDelivered) * 1000) / 10
                : 0,
        };
    }
    async getBroadcastList(filters) {
        const match = this.buildBroadcastMatch(filters);
        const page = filters.page || 1;
        const limit = Math.min(filters.limit || 20, 50);
        const skip = (page - 1) * limit;
        const pipeline = [
            { $match: match },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
                $lookup: {
                    from: 'tags',
                    localField: 'tagIds',
                    foreignField: '_id',
                    pipeline: [{ $project: { name: 1, color: 1 } }],
                    as: '_tags',
                },
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    templateName: 1,
                    status: 1,
                    totalRecipients: 1,
                    counters: 1,
                    scheduledAt: 1,
                    createdAt: 1,
                    tags: {
                        $map: {
                            input: '$_tags',
                            as: 't',
                            in: { id: '$$t._id', name: '$$t.name', color: '$$t.color' },
                        },
                    },
                    deliveryRate: {
                        $cond: [
                            { $gt: ['$counters.sent', 0] },
                            {
                                $round: [
                                    {
                                        $multiply: [
                                            { $divide: ['$counters.delivered', '$counters.sent'] },
                                            100,
                                        ],
                                    },
                                    1,
                                ],
                            },
                            0,
                        ],
                    },
                    readRate: {
                        $cond: [
                            { $gt: ['$counters.delivered', 0] },
                            {
                                $round: [
                                    {
                                        $multiply: [
                                            { $divide: ['$counters.read', '$counters.delivered'] },
                                            100,
                                        ],
                                    },
                                    1,
                                ],
                            },
                            0,
                        ],
                    },
                },
            },
        ];
        const [data, total] = await Promise.all([
            this.broadcastModel.aggregate(pipeline),
            this.broadcastModel.countDocuments(match),
        ]);
        return {
            data,
            pagination: {
                page,
                limit,
                total,
                hasNext: skip + limit < total,
            },
        };
    }
    getBroadcastExportCursor(filters) {
        const match = this.buildBroadcastMatch(filters);
        const pipeline = [
            { $match: match },
            { $sort: { createdAt: -1 } },
            {
                $lookup: {
                    from: 'tags',
                    localField: 'tagIds',
                    foreignField: '_id',
                    pipeline: [{ $project: { name: 1 } }],
                    as: '_tags',
                },
            },
            {
                $project: {
                    name: 1,
                    templateName: 1,
                    status: 1,
                    totalRecipients: 1,
                    sent: '$counters.sent',
                    delivered: '$counters.delivered',
                    failed: '$counters.failed',
                    read: '$counters.read',
                    tags: {
                        $reduce: {
                            input: '$_tags',
                            initialValue: '',
                            in: {
                                $cond: [
                                    { $eq: ['$$value', ''] },
                                    '$$this.name',
                                    { $concat: ['$$value', ', ', '$$this.name'] },
                                ],
                            },
                        },
                    },
                    scheduledAt: 1,
                    createdAt: 1,
                },
            },
        ];
        return this.broadcastModel.aggregate(pipeline).cursor({ batchSize: 500 });
    }
    async getDistinctTemplates(projectConfigId) {
        return this.broadcastModel.distinct('templateName', {
            projectConfigId: new mongoose_2.Types.ObjectId(projectConfigId),
        });
    }
    async getMessageList(filters) {
        const page = filters.page || 1;
        const limit = Math.min(filters.limit || 50, 100);
        const skip = (page - 1) * limit;
        const match = {
            projectConfigId: new mongoose_2.Types.ObjectId(filters.projectConfigId),
            createdAt: this.buildDateRange(filters.startDate, filters.endDate),
            direction: 'outbound',
        };
        if (filters.status && filters.status !== 'all') {
            match.currentStatus = filters.status;
        }
        if (filters.broadcastId && filters.broadcastId !== 'all') {
            match.broadcastId = new mongoose_2.Types.ObjectId(filters.broadcastId);
        }
        if (filters.templateName && filters.templateName !== 'all') {
            match.templateName = filters.templateName;
        }
        if (filters.search && filters.search.length >= 3) {
            match.$or = [
                { recipientNumber: { $regex: filters.search, $options: 'i' } },
                { metaMessageId: filters.search },
            ];
        }
        else if (filters.recipientNumber) {
            match.recipientNumber = {
                $regex: filters.recipientNumber,
                $options: 'i',
            };
        }
        const pipeline = [
            { $match: match },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
                $addFields: {
                    sentAt: {
                        $let: {
                            vars: {
                                entry: {
                                    $arrayElemAt: [
                                        {
                                            $filter: {
                                                input: '$statusHistory',
                                                cond: { $eq: ['$$this.status', 'sent'] },
                                            },
                                        },
                                        0,
                                    ],
                                },
                            },
                            in: '$$entry.timestamp',
                        },
                    },
                    deliveredAt: {
                        $let: {
                            vars: {
                                entry: {
                                    $arrayElemAt: [
                                        {
                                            $filter: {
                                                input: '$statusHistory',
                                                cond: { $eq: ['$$this.status', 'delivered'] },
                                            },
                                        },
                                        0,
                                    ],
                                },
                            },
                            in: '$$entry.timestamp',
                        },
                    },
                    readAt: {
                        $let: {
                            vars: {
                                entry: {
                                    $arrayElemAt: [
                                        {
                                            $filter: {
                                                input: '$statusHistory',
                                                cond: { $eq: ['$$this.status', 'read'] },
                                            },
                                        },
                                        0,
                                    ],
                                },
                            },
                            in: '$$entry.timestamp',
                        },
                    },
                },
            },
            {
                $lookup: {
                    from: 'broadcasts',
                    localField: 'broadcastId',
                    foreignField: '_id',
                    pipeline: [{ $project: { name: 1 } }],
                    as: '_broadcast',
                },
            },
            {
                $project: {
                    _id: 1,
                    recipientNumber: 1,
                    broadcastId: 1,
                    broadcastName: { $arrayElemAt: ['$_broadcast.name', 0] },
                    templateName: 1,
                    currentStatus: 1,
                    sentAt: 1,
                    deliveredAt: 1,
                    readAt: 1,
                    errorDetails: 1,
                    createdAt: 1,
                },
            },
        ];
        const [data, total] = await Promise.all([
            this.messageModel.aggregate(pipeline),
            this.messageModel.countDocuments(match),
        ]);
        return {
            data,
            pagination: {
                page,
                limit,
                total,
                hasNext: skip + limit < total,
            },
        };
    }
    getMessageExportCursor(filters) {
        const match = {
            projectConfigId: new mongoose_2.Types.ObjectId(filters.projectConfigId),
            createdAt: this.buildDateRange(filters.startDate, filters.endDate),
            direction: 'outbound',
        };
        if (filters.status && filters.status !== 'all') {
            match.currentStatus = filters.status;
        }
        if (filters.broadcastId && filters.broadcastId !== 'all') {
            match.broadcastId = new mongoose_2.Types.ObjectId(filters.broadcastId);
        }
        if (filters.templateName && filters.templateName !== 'all') {
            match.templateName = filters.templateName;
        }
        if (filters.recipientNumber) {
            match.recipientNumber = {
                $regex: filters.recipientNumber,
                $options: 'i',
            };
        }
        const pipeline = [
            { $match: match },
            { $sort: { createdAt: -1 } },
            { $limit: 100000 },
            {
                $lookup: {
                    from: 'broadcasts',
                    localField: 'broadcastId',
                    foreignField: '_id',
                    pipeline: [{ $project: { name: 1 } }],
                    as: '_broadcast',
                },
            },
            {
                $project: {
                    recipientNumber: 1,
                    broadcastName: { $arrayElemAt: ['$_broadcast.name', 0] },
                    templateName: 1,
                    currentStatus: 1,
                    errorDetails: 1,
                    createdAt: 1,
                },
            },
        ];
        return this.messageModel.aggregate(pipeline).cursor({ batchSize: 1000 });
    }
};
exports.ReportingService = ReportingService;
exports.ReportingService = ReportingService = ReportingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(message_schema_1.Message.name)),
    __param(1, (0, mongoose_1.InjectModel)(broadcast_schema_1.Broadcast.name)),
    __param(2, (0, mongoose_1.InjectModel)(tag_schema_1.Tag.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], ReportingService);
//# sourceMappingURL=reporting.service.js.map