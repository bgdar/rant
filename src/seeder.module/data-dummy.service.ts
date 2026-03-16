import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { readFile } from 'fs';
import path from 'path';
import { RantIndoService } from 'src/rant.module/rant-indo.service';
import { RantDTO } from 'src/dto/dto';

@Injectable()
export class DataDummyService implements OnApplicationBootstrap {
  constructor(private readonly rantIndoService: RantIndoService) {}

  async onApplicationBootstrap() {
    // sevice ini akan di jalanakn saat aplikasi petama kali jalan
    const isDocument = await this.rantIndoService.cekDocument();

    if (isDocument) {
      this.readFileDummyJson();
      //t his.rantService.create(); // simpan default documenta ke DB
    }
  }

  readFileDummyJson(): RantDTO {
    const pathFile = path.join(__dirname, 'data', 'data.dummy.indo.json');
    readFile(pathFile, (err, data) => {
      // console.log('data dummy indo', data);
      if (err) {
        console.error(err);
        return {} as RantDTO;
      }
      return JSON.parse(data.toString()) as RantDTO;
    });
    return {} as RantDTO;
  }
}
