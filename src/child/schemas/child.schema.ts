import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../user/schemas/user.schema';

export type ChildDocument = Child & Document;

export enum ChildGender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export enum ChildStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Schema({ timestamps: true })
export class Child {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true })
  dateOfBirth: Date;

  @Prop({ required: true, enum: ChildGender })
  gender: ChildGender;

  @Prop({ default: null })
  avatarUrl: string;

  @Prop({ default: null })
  location: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ enum: ChildStatus, default: ChildStatus.ACTIVE })
  status: ChildStatus;

  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: Object, default: {} })
  additionalAttributes: Record<string, any>;
}

export const ChildSchema = SchemaFactory.createForClass(Child);

