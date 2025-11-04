import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Child, ChildDocument } from './schemas/child.schema';
import { User, UserRole } from '../user/schemas/user.schema';
import { CreateChildDto } from './dto/create-child.dto';
import { UpdateChildDto } from './dto/update-child.dto';

@Injectable()
export class ChildService {
  constructor(
    @InjectModel(Child.name) private childModel: Model<ChildDocument>,
    @InjectModel(User.name) private userModel: Model<any>,
  ) {}

  async create(createChildDto: CreateChildDto, currentUser: any): Promise<Child> {
    // Check if child email already exists
    const existingChild = await this.childModel.findOne({ email: createChildDto.email });
    if (existingChild) {
      throw new ConflictException('Child with this email already exists');
    }

    // If current user is a PARENT, they can only create children for themselves
    // If current user is ADMIN, they can create children for any user
    let parentId = currentUser.id;
    
    if (currentUser.role === UserRole.ADMIN) {
      // ADMIN can specify user_id in the DTO
      if (createChildDto.user_id) {
        parentId = createChildDto.user_id;
      }
    } else if (currentUser.type === 'child') {
      throw new ForbiddenException('Children cannot create other children');
    } else if (currentUser.role !== UserRole.PARENT) {
      throw new ForbiddenException('Only PARENT or ADMIN can create children');
    }

    // Verify parent exists
    const parent = await this.userModel.findById(parentId);
    if (!parent) {
      throw new NotFoundException('Parent user not found');
    }

    // Verify parent is actually a PARENT role
    if (parent.role !== UserRole.PARENT) {
      throw new ForbiddenException('Children can only be assigned to users with PARENT role');
    }

    const hashedPassword = await bcrypt.hash(createChildDto.password, 10);
    const { user_id, ...childData } = createChildDto;
    const child = new this.childModel({
      ...childData,
      user_id: parentId,
      password: hashedPassword,
    });

    return child.save();
  }

  async findAll(currentUser: any): Promise<Child[]> {
    // ADMIN can see all children, PARENT can only see their own children
    if (currentUser.role === UserRole.ADMIN) {
      return this.childModel.find().select('-password').populate('user_id', '-password').exec();
    } else if (currentUser.type === 'child') {
      // Children can only see themselves
      return this.childModel.find({ _id: currentUser.id }).select('-password').populate('user_id', '-password').exec();
    } else {
      return this.childModel.find({ user_id: currentUser.id }).select('-password').populate('user_id', '-password').exec();
    }
  }

  async findOne(id: string, currentUser: any): Promise<Child> {
    const child = await this.childModel.findById(id).select('-password').populate('user_id', '-password').exec();
    if (!child) {
      throw new NotFoundException('Child not found');
    }

    // ADMIN can see any child, PARENT can only see their own children
    if (currentUser.role === UserRole.ADMIN) {
      return child;
    } else if (currentUser.type === 'child') {
      // Children can only see themselves
      if (currentUser.id !== id) {
        throw new ForbiddenException('You can only access your own profile');
      }
      return child;
    } else {
      // PARENT can only see their own children
      if (child.user_id.toString() !== currentUser.id) {
        throw new ForbiddenException('You can only access your own children');
      }
      return child;
    }
  }

  async update(id: string, updateChildDto: UpdateChildDto, currentUser: any): Promise<Child> {
    const child = await this.childModel.findById(id);
    if (!child) {
      throw new NotFoundException('Child not found');
    }

    // ADMIN can update any child, PARENT can only update their own children
    if (currentUser.role !== UserRole.ADMIN) {
      if (currentUser.type === 'child') {
        // Children can only update themselves
        if (currentUser.id !== id) {
          throw new ForbiddenException('You can only update your own profile');
        }
      } else {
        // PARENT can only update their own children
        if (child.user_id.toString() !== currentUser.id) {
          throw new ForbiddenException('You can only update your own children');
        }
      }
    }

    // Check if email is being changed and if it's already taken
    if (updateChildDto.email && updateChildDto.email !== child.email) {
      const existingChild = await this.childModel.findOne({ email: updateChildDto.email });
      if (existingChild) {
        throw new ConflictException('Child with this email already exists');
      }
    }

    // Hash password if provided
    if (updateChildDto.password) {
      updateChildDto.password = await bcrypt.hash(updateChildDto.password, 10);
    }

    Object.assign(child, updateChildDto);
    await child.save();
    const { password, ...result } = child.toObject();
    return result as any;
  }

  async remove(id: string, currentUser: any): Promise<void> {
    const child = await this.childModel.findById(id);
    if (!child) {
      throw new NotFoundException('Child not found');
    }

    // Only ADMIN can delete children, or PARENT can delete their own children
    if (currentUser.role === UserRole.ADMIN) {
      // ADMIN can delete any child
    } else if (currentUser.type === 'child') {
      throw new ForbiddenException('Children cannot delete accounts');
    } else if (child.user_id.toString() === currentUser.id) {
      // PARENT can delete their own children
    } else {
      throw new ForbiddenException('You can only delete your own children');
    }

    await this.childModel.findByIdAndDelete(id);
  }

  async getProfile(currentUser: any): Promise<Child> {
    if (currentUser.type !== 'child') {
      throw new ForbiddenException('This endpoint is only for children');
    }

    const child = await this.childModel.findById(currentUser.id).select('-password').populate('user_id', '-password').exec();
    if (!child) {
      throw new NotFoundException('Child not found');
    }
    return child;
  }

  async getChildrenByParent(parentId: string, currentUser: any): Promise<Child[]> {
    // ADMIN can see children of any parent
    // PARENT can only see their own children
    if (currentUser.role !== UserRole.ADMIN && currentUser.id !== parentId) {
      throw new ForbiddenException('You can only view your own children');
    }

    return this.childModel.find({ user_id: parentId }).select('-password').populate('user_id', '-password').exec();
  }
}
