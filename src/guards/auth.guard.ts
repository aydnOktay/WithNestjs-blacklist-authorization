import {
  Injectable,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { UserService } from 'src/api/user/user.service';
import { ApiEc, ApiException } from 'src/exceptions';
import { JwtService } from 'src/services/jwt/jwt.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private userService: UserService
  ) { }

  async canActivate(
    context: ExecutionContext,
  ): Promise<any> {
    const request = context.switchToHttp().getRequest();
    const requestsToken = request.headers.authorization.split(" ")[1]
    if (!requestsToken) {
      throw new ApiException(ApiEc.Unauthorized);
    }
    const data = await this.jwtService.verifyJwt(requestsToken);
    if (!data) {
      throw new ApiException(ApiEc.Unauthorized);
    }
    
    const user =await this.userService.getUserByEmail(data.email)
    if (!user) {
      throw new ApiException(ApiEc.Unauthorized)
    }
    delete user.password;
    request.user = user;
    return true;
  }
  
}
