import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RantDTO } from 'src/dto/dto';
import { RantIndo } from 'src/schemas/rant-indo.schema';

@Injectable()
export class RantIndoService {
  constructor(@InjectModel(RantIndo.name) private rantModel: Model<RantIndo>) {}

  /**
   * Simpan data ke db
   */
  async create(createDto: RantDTO): Promise<RantIndo> {
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
  /**
   *@param name adalaha katagori rant atau name yang akan di isikan valuenya
   * @param value value yang akan di masukan
   */
  async insertValue(name: string, value: string) {
    await this.rantModel.findOneAndUpdate(
      {
        name: name,
      },
      { $push: { value } },
      { upsert: true },
    );
  }
}
