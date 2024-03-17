import { Injectable } from '@nestjs/common';
import { $Enums, Prisma, User } from '@prisma/client';
import { exit } from 'process';
import { PrismaService } from 'src/prisma/prisma.service';
import { CredsService } from 'src/services/creds/creds.service';
import { UserService } from '../user/user.service';
import {
  AuthEmailConfirmRequest,
  AuthForgotPasswordRequest,
  AuthResetPasswordRequest,
  AuthSigninRequest,
  AuthSisgnUpSuccessResponse,
} from './dto';
import { SessionsService } from '../sessions/sessions.service';
import { ApiEc, ApiException } from 'src/exceptions';
import { MailService } from 'src/mail/mail.service';
import { JwtService } from 'src/services/jwt/jwt.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private sessionService: SessionsService,
    private jwtService: JwtService,
    private mailService: MailService,
    private credsService: CredsService,
    private prisma: PrismaService,

  ) { }


  async signup(
    data: Prisma.UserCreateInput,
    ip: string,
    user_agent: string,
    origin: string): Promise<AuthSisgnUpSuccessResponse> {

    if (await this.findBlackList(ip, $Enums.BlackListType.REGISTER)) {
      throw new ApiException(ApiEc.RateLimitError)
    }

    const signuprequest = await this.prisma.signUpRequests.findFirst({
      where: { user_ip: ip }
    })

    if (!signuprequest) {
      await this.createSignUpRequest(ip, origin, user_agent)
      return await this.userService.createUserByEmail(data);
    }

    if (signuprequest.counter >= parseInt(process.env.MAX_ATTEMP_COUNT)) {
      await this.prisma.signUpRequests.delete({ where: { id: signuprequest.id } });
      await this.blackListCreate(ip, $Enums.BlackListType.REGISTER, user_agent)
      throw new ApiException(ApiEc.AccountBloced);
    }

    if (signuprequest.expired_at <= new Date()) {
      await this.prisma.signUpRequests.delete({ where: { id: signuprequest.id } });
      await this.createSignUpRequest(ip, origin, user_agent)
    } else {
      await this.prisma.signUpRequests.update({ where: { id: signuprequest.id }, data: { counter: { increment: 1 } } })
    }

    return await this.userService.createUserByEmail(data);
  }

  async signIn(
    data: AuthSigninRequest,
    ip: string,
    user_agent: string,
    origin: string): Promise<any> {

    const blacklist = await this.findBlackList(ip, $Enums.BlackListType.LOGIN, data.email);
    if (blacklist) {
      throw new ApiException(ApiEc.RateLimitError)
    }

    const signinrequest = await this.prisma.signInRequests.findFirst({
      where: { user_ip: ip, email: data.email }
    })
    if (!signinrequest) {
      await this.createSignInRequest(ip, origin, user_agent, data.email);
      return await this.userService.userSignIn(data);
    }

    if (signinrequest.counter >= parseInt(process.env.MAX_ATTEMP_COUNT)) {
      await this.prisma.signInRequests.delete({ where: { id: signinrequest.id } });
      await this.blackListCreate(ip, $Enums.BlackListType.LOGIN, user_agent, data.email);
      throw new ApiException(ApiEc.AccountBloced);
    }

    if (signinrequest.expired_at <= new Date()) {
      await this.prisma.signInRequests.delete({ where: { id: signinrequest.id } });
      await this.createSignInRequest(ip, origin, user_agent, data.email);
    } else {
      await this.prisma.signInRequests.update({ where: { id: signinrequest.id }, data: { counter: { increment: 1 } } })
    }

    return await this.userService.userSignIn(data);
  }

  async userEmailConfirm(token: string): Promise<any> {
    const { email } = await this.jwtService.verifyEmailConfirmToken(token);
    const user = await this.userService.getUserByEmail(email);
    if (!user) {
      throw new ApiException(ApiEc.UserNotFound);
    }

    const updatedUser = await this.userService.updateUserById(user.id, {
      email_confirmed: true,
    });
    if (updatedUser.email_confirmed) {
      return {
        message: 'Email confirmed',
      };
    }

    throw new ApiException(ApiEc.EmailNotConfirmed);
  }

  async emailConfirm(data: AuthEmailConfirmRequest): Promise<any> {
    const user = await this.userService.getUserByEmail(data.email);
    if (!user) {
      throw new ApiException(ApiEc.UserNotFound);
    }

    if (user.email_confirmed) {
      throw new ApiException(ApiEc.EmailAlreadyConfirmed);
    }

    const token = await this.jwtService.createEmailConfirmToken(user.email);

    await this.mailService.sendUserConfirmation(user, token);
    return {
      message: 'Email sent',
    };
  }

  async forgotPassword(data: AuthForgotPasswordRequest): Promise<any> {
    const user = await this.userService.getUserByEmail(data.email);
    if (!user) {
      throw new ApiException(ApiEc.UserNotFound);
    }
    if (!user.email_confirmed) {
      throw new ApiException(ApiEc.EmailNotConfirmed);
    }

    const token = await this.jwtService.createResetPasswordToken(user.email);

    await this.mailService.sendUserForgotPassword(user, token);
    return {
      message: 'Email sent',
    };
  }

  async resetPassword(
    data: AuthResetPasswordRequest,
    token: string,
  ): Promise<any> {
    // validate token
    const { email } = await this.jwtService.verifyResetPasswordToken(token);

    // check if user exists
    const user = await this.userService.getUserByEmail(email);

    if (!user) {
      throw new ApiException(ApiEc.UserNotFound);
    }

    // update user password
    const hashedPassword = await this.credsService.passwordHash(data.password);
    const updatedUser = await this.userService.updateUserById(user.id, {
      password: hashedPassword,
    });

    return {
      message: 'Password updated',
    };
  }

  private findBlackList = async (ip: string, blacklistType: $Enums.BlackListType, email?: string) => {
    return await this.prisma.blackList.findFirst({
      where: {
        blacklisetType: blacklistType, user_ip: ip, expired_at: {
          gt: new Date()
        }, email
      }
    })
  }

  private blackListCreate = async (ip: string, blacklistType: $Enums.BlackListType, user_agent: string, email?: string) => {
    await this.prisma.blackList.create({
      data: {
        user_ip: ip,
        expired_at: new Date(new Date().getTime() + 15 * 60 * 1000),
        blacklisetType: blacklistType,
        user_agent: user_agent,
        email: email
      }
    })
  }

  private createSignUpRequest = async (ip: string, origin: string, user_agent: string) => {
    return await this.prisma.signUpRequests.create({
      data: { counter: 1, user_ip: ip, origin, user_agent, expired_at: new Date(new Date().getTime() + 15 * 60 * 1000) }
    });
  }

  private createSignInRequest = async (ip: string, origin: string, user_agent: string, email: string) => {
    return await this.prisma.signInRequests.create({
      data: {
        user_agent, origin, user_ip: ip, counter: 1, email: email, expired_at: new Date(new Date().getTime() + 15 * 60 * 1000)
      }
    })
  }

}



