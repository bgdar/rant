// src/schemas/supervisor.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { HydratedDocument } from 'mongoose';
import {
  SupervisorDTO,
  SupervisorPermission,
  SupervisorRole,
} from 'src/dto/supervisor.dto';
import { types } from 'util';

export type SupervisorDocument = HydratedDocument<Supervisor>;

/**
 * Supervisor Schema
 *
 * Digunakan untuk:
 * - Admin
 * - Supervisor
 * - Staff management
 * - Dashboard monitoring
 */
@Schema({
  timestamps: true,
})
export class Supervisor implements SupervisorDTO {
  /**
   * Nama lengkap supervisor.
   */
  @Prop({
    required: true,
    trim: true,
  })
  fullName: string;

  /**
   * Username login.
   */
  @Prop({
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  })
  username: string;

  /**
   * Email supervisor.
   */
  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  })
  email: string;

  /**
   * Password hash bcrypt.
   */
  @Prop({
    required: true,
  })
  password: string;

  /**
   * Role account.
   *
   * Example:
   * - supervisor
   * - admin
   * - owner
   */
  @Prop({
    type: [String],
    default: SupervisorRole.TRAINEE,
    enum: Object.values(SupervisorRole),
  })
  role: string;

  /**
   * Permission list.
   */
  @Prop({
    type: [String],
    enum: Object.values(SupervisorPermission),
    default: [],
  })
  permissions: SupervisorPermission[];

  /**
   * Status active account.
   */
  @Prop({
    default: true,
  })
  isActive: boolean;

  /**
   * Account verified.
   */
  @Prop({
    default: false,
  })
  isVerified: boolean;

  /**
   * Account banned.
   */
  @Prop({
    default: false,
  })
  isBanned: boolean;

  /**
   * Last login date.
   */
  @Prop({
    default: null,
  })
  lastLogin: Date;

  /**
   * Login token/session id.
   */
  @Prop({
    default: null,
  })
  token: string;

  /**
   * Total login counter utnuk supervisor yang masok.
   */
  @Prop({
    default: 0,
  })
  loginCount: number;

  /**
   * Profile image.
   */
  @Prop({
    default: null,
  })
  avatar: string;

  /**
   * Phone number.
   */
  @Prop({
    default: null,
  })
  phone: string;

  /**
   * Address.
   */
  @Prop({
    default: null,
  })
  address: string;

  /**
   * Custom tags.
   */
  @Prop({
    type: [String],
    default: [],
  })
  tags: string[];

  @Prop({
    type: [String],
    default: [],
  })
  usersId?: string[] | undefined;
}

export const SupervisorSchema = SchemaFactory.createForClass(Supervisor);
