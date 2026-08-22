import { AksiEksekusiType, SystemLogsDTO } from '@/dto/system.logs.dto';
import { SystemLog } from '@/schemas/system.logs.schema';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

@Injectable()
export class SystemLogsRepository {
  /**
   * Inject mongoose model SystemLog.
   */
  constructor(
    @InjectModel(SystemLog.name)
    private readonly logModel: Model<SystemLog>,
  ) {}

  /**
   * Mencatat/Membuat log baru ke dalam sistem.
   * Langsung mengembalikan dokumen asli Mongoose tanpa pemetaan tipe data kaku.
   */
  async log(data: SystemLogsDTO) {
    try {
      const newLog = await this.logModel.create({
        ...data,
        // Memastikan timestamp terisi jika tidak dikirim dari DTO
        timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
      });
      return newLog;
    } catch (error: any) {
      throw new BadRequestException(
        'Gagal menyimpan log sistem: ' + error.message,
      );
    }
  }

  /**
   *Mengambil semua log dengan fitur pagination dan filter dinamis.
   * Sangat berguna untuk dashboard supervisor panel saat melacak aktivitas.
   */
  async findAll(filters: {
    pelakuActor?: string;
    aksiEksekusi?: AksiEksekusiType;
    status?: string;
    searchQuery?: string; // Untuk mencari di username forumis/discord/wa/telegram
    page?: number;
    limit?: number;
  }) {
    const {
      pelakuActor,
      aksiEksekusi,
      status,
      searchQuery,
      page = 1,
      limit = 20,
    } = filters;
    const query: any = {};

    // Filter berdasarkan aktor pelaku
    if (pelakuActor) query.pelakuActor = pelakuActor;

    // Filter berdasarkan tipe aksi (enum)
    if (aksiEksekusi) query.aksiEksekusi = aksiEksekusi;

    // Filter berdasarkan status (Success/Failed)
    if (status) query.status = status;

    // Fitur pencarian multi-platform (OR condition) jika ada query teks
    if (searchQuery) {
      query.$or = [
        { usernameForumis: new RegExp(searchQuery, 'i') },
        { usernameDiscord: new RegExp(searchQuery, 'i') },
        { usernameTelegram: new RegExp(searchQuery, 'i') },
        { usernameWhatsapp: new RegExp(searchQuery, 'i') },
        { targetObject: new RegExp(searchQuery, 'i') },
      ];
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.logModel
        .find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.logModel.countDocuments(query).exec(),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Mencari detail satu log spesifik berdasarkan ID Mongoose.
   * @throws NotFoundException
   */
  async findById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Format ID log tidak valid');
    }

    const log = await this.logModel.findById(id).exec();
    if (!log) {
      throw new NotFoundException(`Log dengan ID ${id} tidak ditemukan`);
    }
    return log;
  }

  /**
   *  Mengambil riwayat log spesifik untuk satu target platform tertentu (misal: Discord).
   * Membantu supervisor memantau satu entitas yang mencurigakan.
   */
  async findByPlatformUsername(
    platform: 'discord' | 'telegram' | 'whatsapp' | 'web',
    username: string,
  ) {
    const query: any = {};

    if (platform === 'discord') query.usernameDiscord = username;
    else if (platform === 'telegram') query.usernameTelegram = username;
    else if (platform === 'whatsapp') query.usernameWhatsapp = username;
    else query.usernameForumis = username;

    return await this.logModel.find(query).sort({ timestamp: -1 }).exec();
  }

  /**
   * Membersihkan/Menghapus log lama otomatis (Maintenance Retention Policy).
   * Menghapus log yang usianya sudah lebih dari jumlah hari yang ditentukan (misal: hapus log > 90 hari).
   */
  async clearOldLogs(daysRetention: number = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysRetention);

    const result = await this.logModel
      .deleteMany({
        timestamp: { $lt: cutoffDate },
      })
      .exec();

    return {
      message: `Pembersihan berhasil. ${result.deletedCount} log yang lebih tua dari ${daysRetention} hari telah dihapus.`,
      deletedCount: result.deletedCount,
    };
  }
}
