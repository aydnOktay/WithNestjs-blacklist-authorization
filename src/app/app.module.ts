import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/api/auth/auth.module';
import { SessionsModule } from 'src/api/sessions/sessions.module';
import { UserModule } from 'src/api/user/user.module';
import { MailModule } from 'src/mail/mail.module';
import { CredsModule } from 'src/services/creds/creds.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    CredsModule,
    MailModule,
    JwtModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
