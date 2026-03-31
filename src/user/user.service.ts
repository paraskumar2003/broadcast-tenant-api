import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument, UserRole } from './schemas/user.schema';
import {
  UserProjectAccess,
  UserProjectAccessDocument,
} from './schemas/user-project-access.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(UserProjectAccess.name)
    private accessModel: Model<UserProjectAccessDocument>,
  ) { }

  // ─── User CRUD ────────────────────────────────────────────────────

  async createUser(data: {
    name: string;
    mobile: string;
    password: string;
    role: UserRole;
    createdBy?: string;
  }) {
    const existing = await this.userModel.findOne({
      mobile: data.mobile,
      status: 'active',
    });
    if (existing) {
      throw new BadRequestException('User with this mobile already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    return this.userModel.create({
      name: data.name,
      mobile: data.mobile,
      password: hashedPassword,
      role: data.role,
      createdBy: data.createdBy ? new Types.ObjectId(data.createdBy) : null,
    });
  }

  async listUsers(requestingUser: { sub: string; role: UserRole }) {
    if (requestingUser.role === UserRole.MASTER) {
      return this.userModel
        .find({ status: 'active' })
        .select('-password')
        .sort({ createdAt: -1 });
    }

    if (requestingUser.role === UserRole.SUPER) {
      // Super can see users they created
      return this.userModel
        .find({
          status: 'active',
          $or: [
            { _id: new Types.ObjectId(requestingUser.sub) },
            { createdBy: new Types.ObjectId(requestingUser.sub) },
          ],
        })
        .select('-password')
        .sort({ createdAt: -1 });
    }

    // Executives can only see themselves
    return this.userModel
      .find({ _id: new Types.ObjectId(requestingUser.sub), status: 'active' })
      .select('-password');
  }

  async getUserById(id: string) {
    const user = await this.userModel.findById(id).select('-password');
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateUser(id: string, data: Partial<{ name: string; status: string }>) {
    return this.userModel.findByIdAndUpdate(id, data, { new: true }).select('-password');
  }

  async deleteUser(id: string) {
    return this.userModel.findByIdAndUpdate(id, { status: 'inactive' }, { new: true });
  }

  // ─── Entity RBAC: Project Access ──────────────────────────────────

  async grantProjectAccess(
    userId: string,
    projectId: string,
    grantedBy: string,
    grantorRole: UserRole,
  ) {
    // Verify target user is an executive
    const targetUser = await this.userModel.findById(userId);
    if (!targetUser) throw new NotFoundException('User not found');
    if (targetUser.role !== UserRole.EXECUTIVE) {
      throw new BadRequestException('Project access can only be granted to executives');
    }

    // Check for duplicate
    const existing = await this.accessModel.findOne({
      userId: new Types.ObjectId(userId),
      projectId: new Types.ObjectId(projectId),
    });
    if (existing) {
      throw new BadRequestException('Access already granted for this project');
    }

    return this.accessModel.create({
      userId: new Types.ObjectId(userId),
      projectId: new Types.ObjectId(projectId),
      grantedBy: new Types.ObjectId(grantedBy),
    });
  }

  async revokeProjectAccess(userId: string, projectId: string) {
    const result = await this.accessModel.deleteOne({
      userId: new Types.ObjectId(userId),
      projectId: new Types.ObjectId(projectId),
    });
    if (result.deletedCount === 0) {
      throw new NotFoundException('Access grant not found');
    }
    return { message: 'Access revoked' };
  }

  async getAccessibleProjectIds(userId: string): Promise<Types.ObjectId[]> {
    const grants = await this.accessModel.find({
      userId: new Types.ObjectId(userId),
    });
    return grants.map((g) => g.projectId);
  }

  async listUserAccess(userId: string) {
    return this.accessModel
      .find({ userId: new Types.ObjectId(userId) })
      .populate('projectId')
      .populate('grantedBy', 'name mobile role');
  }
}
