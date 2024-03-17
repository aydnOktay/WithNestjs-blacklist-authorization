import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtService {

  async createSessionJWT(email: string, id: number): Promise<any> {
    return await jwt.sign({ email, id }, process.env.JWT_SECRET, {
      expiresIn: '30m',
    });
  }

  async verifyJwt(token: string): Promise<any> {
    return await jwt.verify(token, process.env.JWT_SECRET);
  }
}
