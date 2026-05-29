import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export enum SupervisorRole {
  TRAINEE = 'Trainee',
  TEACHER = 'Teacher',
  MANAGER = 'Manager',
  DIRECTOR = 'Director',
  CEO = 'CEO',
}
/**
 * Basic Supervisor DTO
 *
 * Biasanya digunakan untuk:
 * - typing
 * - response
 * - model abstraction
 */
export class SupervisorDTO {
  fullName: string;

  username: string;

  email: string;

  password: string;

  role: string;

  permissions: string[];

  isActive: boolean;

  isVerified: boolean;

  isBanned: boolean;

  lastLogin: Date;

  token: string;

  loginCount: number;

  avatar: string;

  phone: string;

  address: string;

  // bawaahan , yang di kaikan dengan supervisor
  usersId?: string[];
}

/**
 * DTO create supervisor.
 */
export class CreateSupervisorDTO {
  @IsString()
  fullName: string;

  @IsString()
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsEnum(['Trainee', 'Teacher', 'Manager', 'Director', 'CEO'])
  role?: string;

  @IsOptional()
  @IsArray()
  permissions?: string[];

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsArray()
  tags?: string[];
}

/**
 * DTO update supervisor.
 */
export class UpdateSupervisorDTO {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsEnum(SupervisorRole)
  role?: string;

  @IsOptional()
  @IsArray()
  permissions?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @IsOptional()
  @IsBoolean()
  isBanned?: boolean;

  @IsOptional()
  @IsString()
  token?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;
}

/**
 * DTO login supervisor/admin.
 */
export class LoginSupervisorDTO {
  @IsString()
  username: string;

  @IsString()
  password: string;
}

/**
 * DTO update role.
 */
export class UpdateSupervisorRoleDTO {
  @IsEnum(SupervisorRole)
  role: string;
}

/**
 * DTO add permission.
 */
export class AddPermissionDTO {
  @IsString()
  permission: string;
}
