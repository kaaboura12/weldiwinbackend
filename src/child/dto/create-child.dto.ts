import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';
import { ChildGender, ChildStatus } from '../schemas/child.schema';

export class CreateChildDto {
  @ApiProperty({ required: false, description: 'Parent user ID (only for ADMIN)' })
  @IsOptional()
  @IsMongoId()
  user_id?: string;
  @ApiProperty({ example: 'Jane' })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({ example: '2015-05-15' })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  dateOfBirth: Date;

  @ApiProperty({ enum: ChildGender, example: ChildGender.FEMALE })
  @IsEnum(ChildGender)
  @IsNotEmpty()
  gender: ChildGender;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ enum: ChildStatus, required: false })
  @IsOptional()
  @IsEnum(ChildStatus)
  status?: ChildStatus;

  @ApiProperty({ example: 'jane.doe@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;
}

