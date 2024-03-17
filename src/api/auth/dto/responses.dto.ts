import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsOptional, IsEmail } from 'class-validator';



export class AuthSisgnUpSuccessResponse {
    @IsString()
    accessToken: string;
}