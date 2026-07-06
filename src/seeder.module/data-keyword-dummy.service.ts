import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { promises as fs } from 'fs'; //  fs berbasis promise

import path from 'path';
import { RantKeywordIndoDbService } from 'src/rant.module/rant-keyword-indo.db.service';
import { RantKeywordDTO } from 'src/dto/data.dto';

@Injectable()
export class DataKeywordDummyService implements OnApplicationBootstrap {
  constructor(private readonly rantIndoService: RantKeywordIndoDbService) {}

  async onApplicationBootstrap() {
    // sevice ini akan di jalanakn saat aplikasi petama kali jalan
    const isDocument = await this.rantIndoService.cekDocument();

    if (isDocument) {
      try {
        const dataFileJson: RantKeywordDTO[] = await this.readFileDummyJson(
          'data-keyword.dummy.indo.json',
        );
        if (dataFileJson.length < 0) {
          console.error('Error mendpatkan data Dummy :', dataFileJson);
          return;
        }
        await this.rantIndoService.createMany(dataFileJson); // simpan default documenta ke DB
      } catch (error) {
        console.error('terjaidi err saat seeder data dummy : ', error);
      }
    }
  }

  async readFileDummyJson(filename: string): Promise<RantKeywordDTO[]> {
    const pathFile = path.join(__dirname, 'data', filename);
    try {
      const data = await fs.readFile(pathFile, 'utf-8');
      return JSON.parse(data) as RantKeywordDTO[];
    } catch (err) {
      console.error('terajdi err : ', err);
      return {} as RantKeywordDTO[];
    }
  }
}
