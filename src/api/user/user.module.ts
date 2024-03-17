import { Global, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CredsModule } from 'src/services/creds/creds.module';
import { MailModule } from 'src/mail/mail.module';
import { JwtService } from 'src/services/jwt/jwt.service';
import { UserController } from './user.controller';

@Global()
@Module({
  imports:[CredsModule,MailModule],
  controllers: [UserController],
  providers: [UserService,PrismaService,JwtService],
  exports:[UserService]
})
export class UserModule {}
