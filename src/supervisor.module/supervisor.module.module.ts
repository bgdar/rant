import { Module } from '@nestjs/common';
import { SupervisorController } from './supervisor.controller';
import { SupervisorDbService } from './supervisor.db.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Supervisor, SupervisorSchema } from 'src/schemas/supervisor.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Supervisor.name,
        schema: SupervisorSchema,
      },
    ]),
  ],

  controllers: [SupervisorController],
  providers: [SupervisorDbService],

  // mau di pakai di : 
  // - UserController
  exports: [
    SupervisorDbService,
  ]
})
export class SupervisorModule {}
