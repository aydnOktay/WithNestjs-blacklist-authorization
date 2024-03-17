import { Module } from '@nestjs/common';
import { CredsService } from './creds.service';

@Module({
  controllers: [],
  providers: [CredsService],
  exports:[CredsService]
})
export class CredsModule {}
