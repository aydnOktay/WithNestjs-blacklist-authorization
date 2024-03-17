import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { User, Prisma } from '@prisma/client';
import { ApiEc, ApiException } from 'src/exceptions';
import { CredsService } from 'src/services/creds/creds.service';
import { verify } from 'crypto';
import { MailService } from 'src/mail/mail.service';
import { JwtService } from 'src/services/jwt/jwt.service';
import { AuthSiginInRequest, AuthSisgnUpSuccessResponse } from '../auth/dto';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private credsService: CredsService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) { }


  async getUserByEmail(email: string): Promise<User> {
    return await this.prisma.user.findUnique({ where: { email } });
  }

  async createUserByEmail(data: Prisma.UserCreateInput): Promise<AuthSisgnUpSuccessResponse> {
    const { firstName, lastName, email, password } = data;

    const user = await this.getUserByEmail(email);
    if (user) {
      throw new ApiException(ApiEc.EmailAlreadyRegistered);
    }
    if (!await this.credsService.isPasswordStrong(password)) {
      throw new ApiException(ApiEc.PasswordNotStrong)
    }

    if (!(password.length >= 6 && password.length <= 12)) {
      throw new ApiException(ApiEc.PasswordLength)
    }

    data.password = await this.credsService.passwordHash(password);
    const newUser = await this.prisma.user.create({
      data,
    });

    const token = await this.jwtService.createEmailConfirmToken(newUser.email);
    const accsessToken = await this.jwtService.createSessionJWT(newUser.email, newUser.id);
    await this.mailService.sendUserConfirmation(newUser, token);
    return accsessToken;
  }

  async userSignIn(data: AuthSiginInRequest): Promise<AuthSisgnUpSuccessResponse> {
    const { email, password } = data;

    if (!(await this.getUserByEmail(email))) {
      throw new ApiException(ApiEc.UserNotFound)
    }


    const user = await this.prisma.user.findUnique({ where: { email } });

    if (user.email_confirmed == false) {
      throw new ApiException(ApiEc.NotAccept)
    }

    if (!(await this.credsService.passwordMatch(password, user.password))) {
      throw new ApiException(ApiEc.PasswordNotMatch)
    };

    const token = await this.jwtService.createSessionJWT(user.email, user.id);
    return await token;
  }

  async updateUserById(id: number, data: Prisma.UserUpdateInput): Promise<any> {
    return await this.prisma.user.update({ where: { id }, data });
  }

  async getUserById(id: number): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new ApiException(ApiEc.UserNotFound);
    }
    delete user.password;
    return user;
  }


}
