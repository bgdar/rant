import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RantDTO } from 'src/dto/dto';
import { RantAceh } from 'src/schemas/rant-aceh.schema';

@Injectable()
export class RantAcehService {
  constructor(@InjectModel(RantAceh.name) private rantModel: Model<RantAceh>) {}

  /**
   * Simpan data ke db
   */
  async create(createDto: RantDTO): Promise<RantAceh> {
    const createRant = new this.rantModel(createDto);

    return createRant.save();
  }

  /**
   * Cek data di document ( table/collection ) apakah kosong atau ada
   */
  async cekDocument(): Promise<boolean> {
    const countDb = await this.rantModel.countDocuments();
    return countDb === 0;
  }
  /**
   * Dapatkan semua name yang ada di database
   * @returns Semua type name
   */
  async getAllName(): Promise<string[]> {
    const result: string[] = [];
    const data = await this.rantModel.find();
    console.info('all data by name : ', data);

    return result;
  }
}
