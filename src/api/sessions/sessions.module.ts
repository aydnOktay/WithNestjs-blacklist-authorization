import { Module } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { CredsModule } from 'src/services/creds/creds.module';
import { UserModule } from '../user/user.module';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports:[CredsModule,UserModule],
  providers: [SessionsService,PrismaService],
  exports:[SessionsService]
})
export class SessionsModule {}
