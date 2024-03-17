import { Controller, Get, Session, UseGuards,Req } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { UserService } from './user.service';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/guards/auth.guard';
import { Request } from 'express';


@Controller('user')
@ApiTags("User")
@UseGuards(AuthGuard)
export class UserController {
  constructor(private userService: UserService) {}

  // @Get('getMyProfile')
  // async getMyProfile(
  //   @Request() req
  // ): Promise<any> {
  //   return await this.userService.getUserById(req.user.id);
  // }


}
