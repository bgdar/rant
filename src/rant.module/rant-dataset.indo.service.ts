import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RantDatasetDTO } from 'src/dto/data.dto';

import { RantDatasetIndo } from 'src/schemas/rant-dataset-indo.schema';

@Injectable()
export class RantDatasetIndoService {
  constructor(
    @InjectModel(RantDatasetIndo.name)
    private rantDatasetIndoModel: Model<RantDatasetIndo>,
  ) {}

  /**
   * Simpan 1 data ke db
   */
  async create(createDto: RantDatasetDTO): Promise<RantDatasetIndo> {
    const createRant = new this.rantDatasetIndoModel(createDto);

    return createRant.save();
  }

  /**
   * Simpan banyak data ke datase
   */
  async createMany(data: RantDatasetDTO[]): Promise<RantDatasetIndo[]> {
    return this.rantDatasetIndoModel.insertMany(data);
  }

  /**
   * Cek data di document ( table/collection ) apakah kosong atau ada
   */
  async cekDocument(): Promise<boolean> {
    const countDb = await this.rantDatasetIndoModel.countDocuments();
    return countDb === 0;
  }
}
