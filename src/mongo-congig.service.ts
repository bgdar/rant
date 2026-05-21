import { Injectable } from '@nestjs/common';
import {
  MongooseModuleOptions,
  MongooseOptionsFactory,
} from '@nestjs/mongoose';
import { url } from 'inspector';

@Injectable()
export class MongoCongigService implements MongooseOptionsFactory {
  createMongooseOptions():
    | Promise<MongooseModuleOptions>
    | MongooseModuleOptions {
    // encodeURIComponent : sebagai tameng pelindung agar karakter khusus di dalam username atau password kamu tidak merusak susunan alamat (string URI) database yang sedang dibaca oleh sistem.
    // yang jelas ps dan usr sama dengan db di container
    const user = encodeURIComponent(process.env.DB_USER || 'dar');
    const password = encodeURIComponent(process.env.DB_PASSWORD || 'dar-rant');
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || '27017';
    const dbName = process.env.DB_NAME || 'rant';

    return {
      uri: `mongodb://${user}:${password}@${host}:${port}/${dbName}?authSource=admin`,
    };
  }
}
