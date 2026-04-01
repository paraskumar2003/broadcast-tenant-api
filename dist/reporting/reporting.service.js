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
const message_session_schema_1 = require("../messaging/schemas/message-session.schema");
const delivery_status_schema_1 = require("../webhook/schemas/delivery-status.schema");
let ReportingService = ReportingService_1 = class ReportingService {
    messageModel;
    sessionModel;
    deliveryStatusModel;
    logger = new common_1.Logger(ReportingService_1.name);
    constructor(messageModel, sessionModel, deliveryStatusModel) {
        this.messageModel = messageModel;
        this.sessionModel = sessionModel;
        this.deliveryStatusModel = deliveryStatusModel;
    }
    async getMessages(filters) {
        const { date, number, sessionId, page = 1, limit = 20 } = filters;
        const skip = (page - 1) * limit;
        const matchStage = {};
        if (date) {
            const start = new Date(date);
            start.setHours(0, 0, 0, 0);
            const end = new Date(date);
            end.setHours(23, 59, 59, 999);
            matchStage.createdAt = { $gte: start, $lte: end };
        }
        if (number) {
            matchStage.recipientNumber = { $regex: number };
        }
        if (sessionId) {
            matchStage.sessionId = sessionId;
        }
        const pipeline = [
            { $match: matchStage },
            {
                $lookup: {
                    from: 'delivery_statuses',
                    localField: 'metaMessageId',
                    foreignField: 'metaMessageId',
                    as: 'deliveryEvents',
                },
            },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
        ];
        const [data, total] = await Promise.all([
            this.messageModel.aggregate(pipeline),
            this.messageModel.countDocuments(matchStage),
        ]);
        return { data, total, page, limit };
    }
    async getSessionSummary(filters) {
        const { date, projectConfigId, page = 1, limit = 20 } = filters;
        const skip = (page - 1) * limit;
        const matchStage = {};
        if (date) {
            const start = new Date(date);
            start.setHours(0, 0, 0, 0);
            const end = new Date(date);
            end.setHours(23, 59, 59, 999);
            matchStage.createdAt = { $gte: start, $lte: end };
        }
        if (projectConfigId) {
            matchStage.projectConfigId = projectConfigId;
        }
        const data = await this.sessionModel
            .find(matchStage)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        const total = await this.sessionModel.countDocuments(matchStage);
        return { data, total, page, limit };
    }
    async getAnalytics(filters) {
        const start = new Date(filters.startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        const matchStage = {
            createdAt: { $gte: start, $lte: end },
        };
        if (filters.templateName) {
            matchStage.templateName = filters.templateName;
        }
        const pipeline = [
            { $match: matchStage },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                        templateName: '$templateName',
                        currentStatus: '$currentStatus',
                    },
                    count: { $sum: 1 },
                },
            },
            {
                $project: {
                    _id: 0,
                    date: '$_id.date',
                    templateName: '$_id.templateName',
                    status: '$_id.currentStatus',
                    count: 1,
                },
            },
            { $sort: { date: 1, templateName: 1 } },
        ];
        return this.messageModel.aggregate(pipeline).allowDiskUse(true);
    }
    getExcelCursor(filters) {
        const start = new Date(filters.date);
        start.setHours(0, 0, 0, 0);
        const end = new Date(filters.date);
        end.setHours(23, 59, 59, 999);
        const matchStage = {
            createdAt: { $gte: start, $lte: end },
        };
        if (filters.templateName) {
            matchStage.templateName = filters.templateName;
        }
        const pipeline = [
            { $match: matchStage },
            {
                $lookup: {
                    from: 'delivery_statuses',
                    localField: 'metaMessageId',
                    foreignField: 'metaMessageId',
                    as: 'deliveryEvents',
                },
            },
            { $unwind: { path: '$deliveryEvents', preserveNullAndEmptyArrays: true } },
        ];
        if (filters.status && filters.status !== '0') {
            pipeline.push({ $match: { 'deliveryEvents.status': filters.status } });
        }
        pipeline.push({
            $project: {
                _id: 0,
                templateName: 1,
                recipientNumber: 1,
                metaMessageId: 1,
                status: { $ifNull: ['$deliveryEvents.status', '$currentStatus'] },
                timestamp: { $ifNull: ['$deliveryEvents.timestamp', '$createdAt'] },
            },
        });
        return this.messageModel.aggregate(pipeline).cursor({ batchSize: 1000 });
    }
};
exports.ReportingService = ReportingService;
exports.ReportingService = ReportingService = ReportingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(message_schema_1.Message.name)),
    __param(1, (0, mongoose_1.InjectModel)(message_session_schema_1.MessageSession.name)),
    __param(2, (0, mongoose_1.InjectModel)(delivery_status_schema_1.DeliveryStatus.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], ReportingService);
//# sourceMappingURL=reporting.service.js.map