import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsOptional,
  isString,
  IsString,
  MinLength,
} from 'class-validator';

export class UserDTO {
  @IsString()
  username: string;
  @IsString()
  email: string;
  @IsString()
  password: string;
  @IsString()
  role: string;
}

export class UserSessionDTO {
  @IsString()
  id: string;

  @IsString()
  username: string;
  @IsString()
  email: string;
  @IsString()
  password: string;
  @IsString()
  role: string;
}

export class CreateUserDTO {
  @IsString()
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsOptional()
  role?: string;
}

export class UserSiginDTO {
  @IsString()
  username: string;
  @IsString()
  password: string;
}

export class UserSignUpDTO {
  @IsString()
  username: string;
  @IsString()
  password: string;
  @IsString()
  email: string;
}

export class UpdateUserDTO {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  // nantik aja
  // @IsOptional()
  // @IsArray()
  // tags?: string[];
}
