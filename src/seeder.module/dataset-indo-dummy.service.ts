import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import path from 'path';
import { RantDatasetDTO } from 'src/dto/dataDTO';

import { promises as fs } from 'fs'; //  fs berbasis promise
import { RantDatasetIndoService } from 'src/rant.module/rant-dataset.indo.service';
@Injectable()
export class DatasetIndoDummyService implements OnApplicationBootstrap {
  constructor(
    private readonly rantDatasetIndoService: RantDatasetIndoService,
  ) {}

  async onApplicationBootstrap() {
    const isDocument = await this.rantDatasetIndoService.cekDocument();
    if (isDocument) {
      try {
        const dataFileJson = await this.readFileDummyJson(
          'dataset.dummy.indo.json',
        );
        if (!dataFileJson) {
          console.error('Error mendpatkan data Dummy :', dataFileJson);
          return;
        }
        await this.rantDatasetIndoService.createMany(dataFileJson); // simpan default documenta ke DB
      } catch (error) {
        console.error('terjaidi err saat seeder data dummy : ', error);
      }
    }
  }

  /**
   * Baca file dummy berdasarkan filename di folder ./data/
   */
  async readFileDummyJson(filename: string): Promise<RantDatasetDTO[]> {
    const pathFile = path.join(__dirname, 'data', filename);
    try {
      const data = await fs.readFile(pathFile, 'utf-8');
      return JSON.parse(data) as RantDatasetDTO[];
    } catch (err) {
      console.error('terajdi err : ', err);
      return {} as RantDatasetDTO[];
    }
  }
}
