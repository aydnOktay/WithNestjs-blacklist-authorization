import { Injectable } from '@nestjs/common';
import * as bcrypt from "bcrypt";

@Injectable()
export class CredsService {

    async passwordHash(password: string): Promise<string> {
        return await bcrypt.hash("asddfasdasd" + password, 10);
    }

    async isPasswordStrong(password:string):Promise<boolean>{
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasSpecialCharacter = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        const hasNumericDigit = /\d/.test(password);
        return hasUpperCase && hasLowerCase && hasSpecialCharacter && hasNumericDigit;
    }

    async passwordMatch(password:string,hashed):Promise<boolean>{
        return await bcrypt.compare("asddfasdasd" + password,hashed)
    }

    async generateVerifyCode() {
        return Math.floor(100000 + Math.random() * 900000);
    }
}
