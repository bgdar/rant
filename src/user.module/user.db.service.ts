import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateUserDTO, UpdateUserDTO, UserDTO } from 'src/dto/user.dto';
import { User } from 'src/schemas/user.schema';

@Injectable()
export class UserDbService {
  /**
   * Inject mongoose model User.
   */
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  /**
   * Membuat user baru.
   * @throws BadRequestException
   * Akan dilempar jika email sudah digunakan
   *
   * Example:
   * ```ts
   * await userDbService.create({
   *   username: 'zero',
   *   email: 'zero@gmail.com',
   *   password: '123456',
   * });
   * ```
   */
  async create(data: CreateUserDTO) {
    const exist = await this.userModel.findOne({
      email: data.email,
      username: data.username,
    });

    if (exist) {
      throw new BadRequestException('Email and username already exists');
    }

    const user = new this.userModel(data);

    return await user.save();
  }

  /**
   * Mengambil semua user.
   *
   * Password otomatis di-hide menggunakan:
   * `.select('-password')`
   *
   * @returns Array user

   */
  async findAll() {
    return this.userModel.find().select('-password');
  }

  /**
   * Mengambil user berdasarkan ID.
   *
   * @param id MongoDB ObjectId user
   *
   * @returns User document
   *
   * @throws NotFoundException
   * Akan dilempar jika user tidak ditemukan
   * ```
   */
  async findById(id: string) {
    const user = await this.userModel.findById(id).select('-password');

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * check apakah ada nama tersebut di database
   */
  async checkByName(username: string): Promise<boolean> {
    const isname = await this.userModel.exists({ username });
    return isname ? true : false;
  }

  /**
   * Mengambil user berdasarkan email.
   *
   * Method ini biasanya digunakan untuk:
   * - Login
   * - Authentication
   * - Validasi email
   *
   * @param email Email user
   *
   */
  async findByEmail(email: string) {
    return this.userModel.findOne({
      email,
    });
  }

  /**
   * Mengambil semua user yang aktif.
   *
   * Filter:
   * ```ts
   * isActive: true
   * ```
   *
   * @returns Array active users
   */
  async findActiveUsers() {
    return this.userModel.find({
      isActive: true,
    });
  }

  /**
   * Search user berdasarkan username.
   *
   * Menggunakan MongoDB regex search.
   *
   * Options:
   * - i = case insensitive
   *
   * @param username Username yang ingin dicari
   *
   * @returns Array user yang cocok
   *
   * Example:
   * ```ts
   * await userDbService.searchByUsername('zer');
   * ```
   */
  async searchByUsername(username: string) {
    return this.userModel.find({
      username: {
        $regex: username,
        $options: 'i',
      },
    });
  }

  /**
   * Update data user.
   *
   * Menggunakan:
   * ```ts
   * findByIdAndUpdate()
   * ```
   *
   * Options:
   * - new: true
   *   -> mengembalikan data terbaru
   *
   * @param id User ID
   * @param data Data yang ingin diupdate
   *
   * @returns Updated user
   *
   * @throws NotFoundException
   *
   * Example:
   * ```ts
   * await userDbService.update(id, {
   *   username: 'new-name',
   * });
   * ```
   */
  async update(id: string, data: UpdateUserDTO): Promise<UserDTO> {
    const user = await this.userModel.findByIdAndUpdate(id, data, {
      new: true,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Update role user.
   *
   * @param id User ID
   * @param role Role baru
   *
   * @returns Updated user
   *
   * Example:
   * ```ts
   * await userDbService.updateRole(
   *   id,
   *   'ugnest',
   * );
   * ```
   */
  async updateRole(id: string, role: string): Promise<UserDTO> {
    const user = await this.userModel.findByIdAndUpdate(
      id,
      {
        role,
      },
      {
        new: true,
      },
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Toggle status active user.
   *
   * Jika:
   * - true  -> false
   * - false -> true
   *
   * @param id User ID
   *
   * @returns Updated user
   *
   * @throws NotFoundException
   */
  // async toggleActive(id: string) {
  //   const user = await this.userModel.findById(id);

  //   if (!user) {
  //     throw new NotFoundException('User not found');
  //   }

  //   user.isActive = !user.isActive;

  //   await user.save();

  //   return user;
  // }

  /**
   * Menambahkan tag ke user.
   *
   * Menggunakan:
   * `$addToSet`
   *
   * @param id User ID
   * @param tag Tag baru
   *
   * @returns Updated user
   *
   * Example:
   * ```ts
   * await userDbService.addTag(
   *   id,
   *   'developer',
   * );
   * ```
   */
  async addTag(id: string, tag: string): Promise<any> {
    return this.userModel.findByIdAndUpdate(
      id,
      {
        $addToSet: {
          tags: tag,
        },
      },
      {
        new: true,
      },
    );
  }

  /**
   * Menghapus tag dari user.
   *
   * Menggunakan:
   * `$pull`
   *
   * @param id User ID
   * @param tag Tag yang dihapus
   *
   * @returns Updated user
   *
   * Example:
   * ```ts
   * await userDbService.removeTag(
   *   id,
   *   'developer',
   * );
   * ```
   */
  async removeTag(id: string, tag: string): Promise<any> {
    return this.userModel.findByIdAndUpdate(
      id,
      {
        $pull: {
          tags: tag,
        },
      },
      {
        new: true,
      },
    );
  }
  /**
   * Menghapus user berdasarkan ID.
   *
   * @param id User ID
   *
   * @returns Message delete success
   *
   * @throws NotFoundException
   *
   * Example:
   * ```ts
   * await userDbService.delete(id);
   * ```
   */
  async delete(id: string) {
    const user = await this.userModel.findByIdAndDelete(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      message: 'User deleted',
    };
  }

  /**
   * Menghapus semua user inactive.
   *
   * Filter:
   * ```ts
   * isActive: false
   * ```
   *
   * @returns MongoDB delete result
   *
   * Example:
   * ```ts
   * await userDbService.deleteAllInactiveUsers();
   * ```
   */
  // async deleteAllInactiveUsers() : Promise< {
  //   return this.userModel.deleteMany({
  //     isActive: false,
  //   });
  // }

  /**
   * Menghitung total semua user.
   *
   * Menggunakan:
   * ```ts
   * countDocuments()
   * ```
   *
   * @returns Total user
   *
   * Example:
   * ```ts
   * const total =
   *   await userDbService.countUsers();
   * ```
   */
  async countUsers(): Promise<number> {
    return await this.userModel.countDocuments();
  }

  /**
   * Menghitung total user aktif.
   *
   * @returns Total active users
   *
   * Example:
   * ```ts
   * const total =
   *   await userDbService.countActiveUsers();
   * ```
   */
  async countActiveUsers(): Promise<number> {
    return await this.userModel.countDocuments({
      isActive: true,
    });
  }
}
