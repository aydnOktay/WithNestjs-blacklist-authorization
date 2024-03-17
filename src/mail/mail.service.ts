import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendUserConfirmation(user: User, token: string): Promise<void> {
    const url = `${process.env.BASE_URL}/auth/confirm/${token}`;

    await this.mailerService.sendMail({
      to: user.email,
      // from: '"Support Team" <support@example.com>', // override default from
      subject: 'Welcome to Nice App! Confirm your Email',
      template: './confirmation', // `.hbs` extension is appended automatically
      context: {
        name: user.firstName,
        url,
      },
    });
  }
  async sendUserForgotPassword(user: User, token: string): Promise<void> {
    const url = `${process.env.CLIENT_URL}/auth/reset-password?token=${token}`;
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Reset Password',
      template: './forgot-password',
      context: {
        name: user.firstName,
        url,
      },
    });
  }
}
