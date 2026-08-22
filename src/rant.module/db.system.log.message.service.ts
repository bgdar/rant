// real time data yang di kirim dengan bantuan web socket
//
//

import { AppGateway } from '@/gateway/app.gateway';
import { SystemLog, SystemLogDocument } from '@/schemas/system.logs.schema';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
/*
 * dengarkan perubahan pada database untuk keperluan data realtime
 */
export class DbSystemLogMessageService implements OnModuleInit {
  constructor(
    // mirip repository
    @InjectModel(SystemLog.name) private logModel: Model<SystemLogDocument>,
    private readonly appGateway: AppGateway, // Inject gateway ke dalam service
  ) {}

  onModuleInit() {
    const changeStream = this.logModel.watch();

    changeStream.on('change', (change) => {
      // Filter hanya untuk data baru yang masuk (insert)
      if (change.operationType === 'insert') {
        const dataBaru = change.fullDocument;

        this.appGateway.handleDBSystemLog(dataBaru);
      }
    });
  }
}
