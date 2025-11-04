import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../user/schemas/user.schema';
import { Child, ChildDocument } from '../../child/schemas/child.schema';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  type: 'user' | 'child';
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Child.name) private childModel: Model<ChildDocument>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    });
  }

  async validate(payload: JwtPayload) {
    if (payload.type === 'user') {
      const user = await this.userModel.findById(payload.sub);
      if (!user || user.status !== 'ACTIVE') {
        throw new UnauthorizedException('User not found or inactive');
      }
      return { id: (user._id as any).toString(), email: user.email, role: user.role, type: 'user' };
    } else if (payload.type === 'child') {
      const child = await this.childModel.findById(payload.sub);
      if (!child || !child.isActive || child.status !== 'ACTIVE') {
        throw new UnauthorizedException('Child not found or inactive');
      }
      return { 
        id: (child._id as any).toString(), 
        email: child.email, 
        parentId: (child.user_id as any).toString(), 
        type: 'child' 
      };
    }
    throw new UnauthorizedException('Invalid token type');
  }
}

