import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  Session,
  Headers,
  UseGuards,
  Ip,
  Request,
  Req
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Prisma } from '@prisma/client';
import {
  AuthEmailConfirmRequest,
  AuthForgotPasswordRequest,
  AuthResetPasswordRequest,
  AuthSiginInRequest,
  AuthSigninRequest,
  AuthSignupRequest,
  AuthSisgnUpSuccessResponse,
} from './dto';
import { MailService } from 'src/mail/mail.service';
import { JwtService } from 'src/services/jwt/jwt.service';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/guards/auth.guard';


@Controller('auth')
@ApiTags("Auth")
export class AuthController {
  constructor(
    private authService: AuthService,
    private mailService: MailService
  ) { }

  @Post('signup')
  async signup(
    @Body() data: AuthSignupRequest,
    @Ip() ip,
    @Req() request:Request
  ): Promise<AuthSisgnUpSuccessResponse> {
    const user_agent = request.headers["user-agent"];
    const origin = request.headers["host"];
    return await this.authService.signup(data,ip,user_agent,origin);
  }

  @Post('signin')
  async signIn(
    @Body() data: AuthSiginInRequest,
    @Ip() ip,
    @Req() request : Request
  ): Promise<AuthSisgnUpSuccessResponse> {
    const user_agent = request.headers["user-agent"];
    const origin = request.headers["host"];
    const token = await this.authService.signIn(data,ip,user_agent,origin);
    return token;
  }

  @Get('signout')
  async signout(@Session() session: Record<string, any>): Promise<any> {
    // destroy session
    session.destroy();
    return {
      message: 'Signed out',
    };
  }


  @Get('confirm/:token')
  async confirm(@Param('token') token: string): Promise<any> {
    return await this.authService.userEmailConfirm(token);
  }

  @Post('email-confirm')
  async emailConfirm(@Body() data: AuthEmailConfirmRequest): Promise<any> {
    return await this.authService.emailConfirm(data);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() data: AuthForgotPasswordRequest): Promise<any> {
    return await this.authService.forgotPassword(data);
  }

  @Post('reset-password')
  async resetPassword(
    @Body() data: AuthResetPasswordRequest,
    @Query('token') token: string,
  ): Promise<any> {
    return await this.authService.resetPassword(data, token);
  }
}
