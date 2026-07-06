import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RantKeywordDTO } from 'src/dto/data.dto';

import { RantKeywordAceh } from 'src/schemas/rant-keyword-aceh.schema';

@Injectable()
export class RantAcehDbService {
  constructor(
    @InjectModel(RantKeywordAceh.name)
    private rantModel: Model<RantKeywordAceh>,
  ) {}

  /**
   * Simpan data ke db
   */
  async create(createDto: RantKeywordDTO): Promise<RantKeywordAceh> {
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
