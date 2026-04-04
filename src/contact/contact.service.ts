import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { parse } from 'csv-parse/sync';

import { Contact, ContactDocument } from './schemas/contact.schema';
import {
  ContactTagging,
  ContactTaggingDocument,
} from '../tagging/schemas/contact-tagging.schema';
import { Tag, TagDocument } from '../tagging/schemas/tag.schema';
import {
  CreateContactDto,
  UpdateContactDto,
  ListContactsQueryDto,
  CsvImportResultDto,
} from './dto/contact.dto';

@Injectable()
export class ContactService {
  constructor(
    @InjectModel(Contact.name)
    private readonly contactModel: Model<ContactDocument>,

    @InjectModel(ContactTagging.name)
    private readonly contactTaggingModel: Model<ContactTaggingDocument>,

    @InjectModel(Tag.name)
    private readonly tagModel: Model<TagDocument>,
  ) { }

  // ─── Create Single Contact ────────────────────────────────────────────────

  async create(dto: CreateContactDto) {
    const projectId = new Types.ObjectId(dto.projectId);

    let contact: ContactDocument;
    try {
      contact = await this.contactModel.create({
        projectId,
        name: dto?.name ?? "Unknown User",
        mobile: dto.mobile,
        metadata: dto.metadata ?? {},
      });
    } catch (err: any) {
      if (err.code === 11000) {
        throw new ConflictException(
          `Contact with mobile "${dto.mobile}" already exists for this project.`,
        );
      }
      throw err;
    }

    // Attach optional tags
    if (dto.tagIds && dto.tagIds.length > 0) {
      await this.attachTagsToContact(projectId, contact._id as Types.ObjectId, dto.tagIds);
    }

    return contact;
  }

  // ─── List Contacts by Project (paginated, optional tag filter) ────────────

  async findByProject(projectId: string, query: ListContactsQueryDto) {
    const projId = new Types.ObjectId(projectId);
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    // If filtering by tag, find contactIds that have this tag
    let contactIdFilter: Types.ObjectId[] | null = null;
    if (query.tagId) {
      const mappings = await this.contactTaggingModel.find({
        projectId: projId,
        tagId: new Types.ObjectId(query.tagId),
      });
      contactIdFilter = mappings.map((m) => m.contactId);
    }

    const filter: Record<string, any> = { projectId: projId };
    if (query.active === true) filter.isActive = true;
    else if (query.active === false) filter.isActive = false;
    // omitted → no isActive filter → return all
    if (contactIdFilter !== null) {
      filter._id = { $in: contactIdFilter };
    }
    if (query.search?.trim()) {
      const regex = new RegExp(query.search.trim(), 'i');
      filter.$or = [{ name: regex }, { mobile: regex }];
    }

    const [contacts, total] = await Promise.all([
      this.contactModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      this.contactModel.countDocuments(filter),
    ]);

    // Populate tags for each contact
    const contactIds = contacts.map((c) => c._id);
    const tagMappings = await this.contactTaggingModel
      .find({ projectId: projId, contactId: { $in: contactIds } })
      .populate('tagId');

    const tagsByContact: Record<string, any[]> = {};
    for (const mapping of tagMappings) {
      const cid = mapping.contactId.toString();
      if (!tagsByContact[cid]) tagsByContact[cid] = [];
      if (mapping.tagId) tagsByContact[cid].push(mapping.tagId);
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

  // ─── Get Single Contact ───────────────────────────────────────────────────

  async findById(id: string) {
    const contact = await this.contactModel.findOne({ _id: id, isActive: true });
    if (!contact) throw new NotFoundException('Contact not found');

    const tagMappings = await this.contactTaggingModel
      .find({ contactId: new Types.ObjectId(id) })
      .populate('tagId');

    return {
      ...contact.toObject(),
      tags: tagMappings.map((m) => m.tagId).filter(Boolean),
    };
  }

  // ─── Update Contact ───────────────────────────────────────────────────────

  async update(id: string, dto: UpdateContactDto) {
    const { addTagIds, removeTagIds, ...fields } = dto;

    // Update scalar fields only if any were provided
    const contact = await this.contactModel.findOneAndUpdate(
      { _id: id, isActive: true },
      { $set: fields },
      { new: true, runValidators: true },
    );
    if (!contact) throw new NotFoundException('Contact not found');

    const contactObjectId = contact._id as Types.ObjectId;
    const projectId = contact.projectId;

    // Run tag operations in parallel
    await Promise.all([
      // Attach new tags
      addTagIds?.length
        ? this.attachTagsToContact(projectId, contactObjectId, addTagIds)
        : Promise.resolve(),

      // Detach removed tags
      removeTagIds?.length
        ? this.contactTaggingModel.deleteMany({
          contactId: contactObjectId,
          tagId: { $in: removeTagIds.map((t) => new Types.ObjectId(t)) },
        })
        : Promise.resolve(),
    ]);

    // Return contact with updated tags
    const tagMappings = await this.contactTaggingModel
      .find({ contactId: contactObjectId })
      .populate('tagId');

    return {
      ...contact.toObject(),
      tags: tagMappings.map((m) => m.tagId).filter(Boolean),
    };
  }

  // ─── Soft Delete ──────────────────────────────────────────────────────────

  async delete(id: string) {
    const contact = await this.contactModel.findOneAndUpdate(
      { _id: id, isActive: true },
      { $set: { isActive: false } },
      { new: true },
    );
    if (!contact) throw new NotFoundException('Contact not found');
    return { message: 'Contact deleted successfully' };
  }

  // ─── Reactivate Contact ──────────────────────────────────────────────────

  async reactivate(id: string) {
    const contact = await this.contactModel.findOneAndUpdate(
      { _id: id, isActive: false },
      { $set: { isActive: true } },
      { new: true },
    );
    if (!contact) throw new NotFoundException('Inactive contact not found');
    return { message: 'Contact reactivated successfully', contact };
  }

  // ─── CSV Import ───────────────────────────────────────────────────────────

  async importFromCsv(
    projectId: string,
    fileBuffer: Buffer,
  ): Promise<CsvImportResultDto> {
    const projId = new Types.ObjectId(projectId);

    // Parse CSV → array of records
    const records: Record<string, string>[] = parse(fileBuffer, {
      columns: true,         // first row = headers
      skip_empty_lines: true,
      trim: true,
    });

    const result: CsvImportResultDto = { imported: 0, skipped: 0, errors: [] };

    // Build tag name→id lookup (lazy, project-scoped)
    const tagCache = new Map<string, Types.ObjectId>();
    const getTagId = async (name: string): Promise<Types.ObjectId | null> => {
      const key = name.toLowerCase().trim();
      if (tagCache.has(key)) return tagCache.get(key)!;
      const tag = await this.tagModel.findOne({ projectId: projId, name: { $regex: new RegExp(`^${key}$`, 'i') } });
      if (!tag) return null;
      tagCache.set(key, tag._id as Types.ObjectId);
      return tag._id as Types.ObjectId;
    };

    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      const rowNum = i + 2; // +2 for 1-indexed + header row

      // Validate required fields
      if (!row.mobile?.trim()) {
        result.errors.push({ row: rowNum, reason: 'Missing required fields: mobile' });
        result.skipped++;
        continue;
      }

      // Upsert contact
      let contact: ContactDocument;
      try {
        contact = await this.contactModel.findOneAndUpdate(
          { projectId: projId, mobile: row.mobile.trim() },
          {
            $set: {
              name: row.name?.trim() ?? "Unknown User",
              metadata: this.extractMetadata(row),
            },
            $setOnInsert: { projectId: projId, mobile: row.mobile.trim(), isActive: true },
          },
          { upsert: true, new: true },
        );
      } catch (err: any) {
        result.errors.push({ row: rowNum, reason: err.message });
        result.skipped++;
        continue;
      }

      // Attach tags (if any)
      const rawTags: string = row.tags || '';
      const tagNames = rawTags.split(',').map((t) => t.trim()).filter(Boolean);

      for (const tagName of tagNames) {
        let tagId = await getTagId(tagName);
        if (!tagId) {
          // Auto-create the tag for this project
          const newTag = await this.tagModel.create({
            projectId: projId,
            name: tagName,
            color: '#3B82F6',
          });
          tagId = newTag._id as Types.ObjectId;
          tagCache.set(tagName.toLowerCase().trim(), tagId);
        }
        try {
          await this.contactTaggingModel.create({
            projectId: projId,
            tagId,
            contactId: contact._id,
          });
        } catch (err: any) {
          if (err.code !== 11000) {
            // 11000 = duplicate (already attached) — safe to ignore
            result.errors.push({ row: rowNum, reason: `Tag attach error: ${err.message}` });
          }
        }
      }

      result.imported++;
    }

    return result;
  }

  // ─── Sample CSV Buffer ────────────────────────────────────────────────────

  getSampleCsvBuffer(): Buffer {
    const content = [
      'name,mobile,tags',
      'John Doe,+919876543210,"vip,newsletter"',
      'Jane Smith,+911234567890,vip',
      'Alex Kumar,+917777777777,',
    ].join('\n');
    return Buffer.from(content, 'utf-8');
  }

  // ─── Private Helpers ──────────────────────────────────────────────────────

  private async attachTagsToContact(
    projectId: Types.ObjectId,
    contactId: Types.ObjectId,
    tagIds: string[],
  ) {
    for (const tagId of tagIds) {
      try {
        await this.contactTaggingModel.create({
          projectId,
          tagId: new Types.ObjectId(tagId),
          contactId,
        });
      } catch (err: any) {
        if (err.code !== 11000) throw err; // ignore duplicate
      }
    }
  }

  /** Extracts extra CSV columns (anything other than name, mobile, tags) as metadata */
  private extractMetadata(row: Record<string, string>): Record<string, string> {
    const skip = new Set(['name', 'mobile', 'tags']);
    return Object.fromEntries(
      Object.entries(row).filter(([k]) => !skip.has(k.toLowerCase())),
    );
  }
}
