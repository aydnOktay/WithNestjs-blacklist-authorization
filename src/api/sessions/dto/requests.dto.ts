import { IsString, IsNotEmpty, IsOptional, IsEmail } from 'class-validator';

export class SessionCreateDto {
    @IsNotEmpty()
    @IsString()
    email: string;

    @IsNotEmpty()
    password: string;
}