import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RantKeywordDTO } from 'src/dto/dataDTO';
import { RantKeywordIndo } from 'src/schemas/rant-keyword-indo.schema';

@Injectable()
export class RantKeywordIndoDbService {
  constructor(
    @InjectModel(RantKeywordIndo.name)
    private rantModel: Model<RantKeywordIndo>,
  ) {}

  /**
   * Simpan 1 data ke db
   */
  async create(createDto: RantKeywordIndo): Promise<RantKeywordIndo> {
    const createRant = new this.rantModel(createDto);

    return await createRant.save();
  }

  /*
   * Simpan banyak data ke datasbe
   */
  async createMany(data: RantKeywordDTO[]): Promise<RantKeywordDTO[]> {
    return this.rantModel.insertMany(data);
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
