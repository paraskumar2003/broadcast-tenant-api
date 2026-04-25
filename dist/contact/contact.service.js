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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const sync_1 = require("csv-parse/sync");
const contact_schema_1 = require("./schemas/contact.schema");
const contact_tagging_schema_1 = require("../tagging/schemas/contact-tagging.schema");
const tag_schema_1 = require("../tagging/schemas/tag.schema");
let ContactService = class ContactService {
    contactModel;
    contactTaggingModel;
    tagModel;
    constructor(contactModel, contactTaggingModel, tagModel) {
        this.contactModel = contactModel;
        this.contactTaggingModel = contactTaggingModel;
        this.tagModel = tagModel;
    }
    async getTagsSummary(projectId) {
        const projId = new mongoose_2.Types.ObjectId(projectId);
        const summary = await this.contactTaggingModel.aggregate([
            { $match: { projectId: projId } },
            {
                $lookup: {
                    from: 'contacts',
                    localField: 'contactId',
                    foreignField: '_id',
                    as: 'contact',
                },
            },
            { $unwind: '$contact' },
            { $match: { 'contact.isActive': true } },
            {
                $group: {
                    _id: '$tagId',
                    contactCount: { $sum: 1 },
                },
            },
            {
                $lookup: {
                    from: 'tags',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'tag',
                },
            },
            { $unwind: '$tag' },
            {
                $project: {
                    _id: 0,
                    tagId: '$_id',
                    name: '$tag.name',
                    color: '$tag.color',
                    contactCount: 1,
                },
            },
            { $sort: { name: 1 } },
        ]);
        const allTags = await this.tagModel.find({ projectId: projId }).lean();
        const tagMap = new Map(summary.map((s) => [s.tagId.toString(), s]));
        return allTags.map((tag) => ({
            tagId: tag._id,
            name: tag.name,
            color: tag.color,
            contactCount: tagMap.get(tag._id.toString())?.contactCount ?? 0,
        }));
    }
    async create(dto) {
        const projectId = new mongoose_2.Types.ObjectId(dto.projectId);
        let contact;
        try {
            contact = await this.contactModel.create({
                projectId,
                name: dto?.name ?? 'Unknown User',
                mobile: dto.mobile,
                metadata: dto.metadata ?? {},
            });
        }
        catch (err) {
            if (err.code === 11000) {
                throw new common_1.ConflictException(`Contact with mobile "${dto.mobile}" already exists for this project.`);
            }
            throw err;
        }
        if (dto.tagIds && dto.tagIds.length > 0) {
            await this.attachTagsToContact(projectId, contact._id, dto.tagIds);
        }
        return contact;
    }
    async findByProject(projectId, query) {
        const projId = new mongoose_2.Types.ObjectId(projectId);
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const skip = (page - 1) * limit;
        let contactIdFilter = null;
        if (query.tagId) {
            const mappings = await this.contactTaggingModel.find({
                projectId: projId,
                tagId: new mongoose_2.Types.ObjectId(query.tagId),
            });
            contactIdFilter = mappings.map((m) => m.contactId);
        }
        const filter = { projectId: projId };
        if (query.active === true)
            filter.isActive = true;
        else if (query.active === false)
            filter.isActive = false;
        if (contactIdFilter !== null) {
            filter._id = { $in: contactIdFilter };
        }
        if (query.search?.trim()) {
            const regex = new RegExp(query.search.trim(), 'i');
            filter.$or = [{ name: regex }, { mobile: regex }];
        }
        const [contacts, total] = await Promise.all([
            this.contactModel
                .find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            this.contactModel.countDocuments(filter),
        ]);
        const contactIds = contacts.map((c) => c._id);
        const tagMappings = await this.contactTaggingModel
            .find({ projectId: projId, contactId: { $in: contactIds } })
            .populate('tagId');
        const tagsByContact = {};
        for (const mapping of tagMappings) {
            const cid = mapping.contactId.toString();
            if (!tagsByContact[cid])
                tagsByContact[cid] = [];
            if (mapping.tagId)
                tagsByContact[cid].push(mapping.tagId);
        }
        const data = contacts.map((c) => ({
            ...c.toObject(),
            tags: tagsByContact[c._id.toString()] ?? [],
        }));
        return {
            data,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }
    async findById(id) {
        const contact = await this.contactModel.findOne({
            _id: id,
            isActive: true,
        });
        if (!contact)
            throw new common_1.NotFoundException('Contact not found');
        const tagMappings = await this.contactTaggingModel
            .find({ contactId: new mongoose_2.Types.ObjectId(id) })
            .populate('tagId');
        return {
            ...contact.toObject(),
            tags: tagMappings.map((m) => m.tagId).filter(Boolean),
        };
    }
    async update(id, dto) {
        const { addTagIds, removeTagIds, ...fields } = dto;
        const contact = await this.contactModel.findOneAndUpdate({ _id: id, isActive: true }, { $set: fields }, { new: true, runValidators: true });
        if (!contact)
            throw new common_1.NotFoundException('Contact not found');
        const contactObjectId = contact._id;
        const projectId = contact.projectId;
        await Promise.all([
            addTagIds?.length
                ? this.attachTagsToContact(projectId, contactObjectId, addTagIds)
                : Promise.resolve(),
            removeTagIds?.length
                ? this.contactTaggingModel.deleteMany({
                    contactId: contactObjectId,
                    tagId: { $in: removeTagIds.map((t) => new mongoose_2.Types.ObjectId(t)) },
                })
                : Promise.resolve(),
        ]);
        const tagMappings = await this.contactTaggingModel
            .find({ contactId: contactObjectId })
            .populate('tagId');
        return {
            ...contact.toObject(),
            tags: tagMappings.map((m) => m.tagId).filter(Boolean),
        };
    }
    async delete(id) {
        const contact = await this.contactModel.findOneAndUpdate({ _id: id, isActive: true }, { $set: { isActive: false } }, { new: true });
        if (!contact)
            throw new common_1.NotFoundException('Contact not found');
        return { message: 'Contact deleted successfully' };
    }
    async reactivate(id) {
        const contact = await this.contactModel.findOneAndUpdate({ _id: id, isActive: false }, { $set: { isActive: true } }, { new: true });
        if (!contact)
            throw new common_1.NotFoundException('Inactive contact not found');
        return { message: 'Contact reactivated successfully', contact };
    }
    async importFromCsv(projectId, fileBuffer) {
        const projId = new mongoose_2.Types.ObjectId(projectId);
        const records = (0, sync_1.parse)(fileBuffer, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
        });
        const result = { imported: 0, skipped: 0, errors: [] };
        const tagCache = new Map();
        const getTagId = async (name) => {
            const key = name.toLowerCase().trim();
            if (tagCache.has(key))
                return tagCache.get(key);
            const tag = await this.tagModel.findOne({
                projectId: projId,
                name: { $regex: new RegExp(`^${key}$`, 'i') },
            });
            if (!tag)
                return null;
            tagCache.set(key, tag._id);
            return tag._id;
        };
        for (let i = 0; i < records.length; i++) {
            const row = records[i];
            const rowNum = i + 2;
            if (!row.mobile?.trim()) {
                result.errors.push({
                    row: rowNum,
                    reason: 'Missing required fields: mobile',
                });
                result.skipped++;
                continue;
            }
            let contact;
            try {
                contact = await this.contactModel.findOneAndUpdate({ projectId: projId, mobile: row.mobile.trim() }, {
                    $set: {
                        name: row.name?.trim() ?? 'Unknown User',
                        metadata: this.extractMetadata(row),
                    },
                    $setOnInsert: {
                        projectId: projId,
                        mobile: row.mobile.trim(),
                        isActive: true,
                    },
                }, { upsert: true, new: true });
            }
            catch (err) {
                result.errors.push({ row: rowNum, reason: err.message });
                result.skipped++;
                continue;
            }
            const rawTags = row.tags || '';
            const tagNames = rawTags
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean);
            for (const tagName of tagNames) {
                let tagId = await getTagId(tagName);
                if (!tagId) {
                    const newTag = await this.tagModel.create({
                        projectId: projId,
                        name: tagName,
                        color: '#3B82F6',
                    });
                    tagId = newTag._id;
                    tagCache.set(tagName.toLowerCase().trim(), tagId);
                }
                try {
                    await this.contactTaggingModel.create({
                        projectId: projId,
                        tagId,
                        contactId: contact._id,
                    });
                }
                catch (err) {
                    if (err.code !== 11000) {
                        result.errors.push({
                            row: rowNum,
                            reason: `Tag attach error: ${err.message}`,
                        });
                    }
                }
            }
            result.imported++;
        }
        return result;
    }
    getSampleCsvBuffer() {
        const content = [
            'name,mobile,tags',
            'John Doe,+919876543210,"vip,newsletter"',
            'Jane Smith,+911234567890,vip',
            'Alex Kumar,+917777777777,',
        ].join('\n');
        return Buffer.from(content, 'utf-8');
    }
    async attachTagsToContact(projectId, contactId, tagIds) {
        for (const tagId of tagIds) {
            try {
                await this.contactTaggingModel.create({
                    projectId,
                    tagId: new mongoose_2.Types.ObjectId(tagId),
                    contactId,
                });
            }
            catch (err) {
                if (err.code !== 11000)
                    throw err;
            }
        }
    }
    extractMetadata(row) {
        const skip = new Set(['name', 'mobile', 'tags']);
        return Object.fromEntries(Object.entries(row).filter(([k]) => !skip.has(k.toLowerCase())));
    }
};
exports.ContactService = ContactService;
exports.ContactService = ContactService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(contact_schema_1.Contact.name)),
    __param(1, (0, mongoose_1.InjectModel)(contact_tagging_schema_1.ContactTagging.name)),
    __param(2, (0, mongoose_1.InjectModel)(tag_schema_1.Tag.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], ContactService);
//# sourceMappingURL=contact.service.js.map