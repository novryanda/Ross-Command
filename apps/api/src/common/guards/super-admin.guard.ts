import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ApiException } from '../utils/api-exception.util';
import { HttpStatus } from '@nestjs/common';
import { AuthenticatedRequest } from './session-auth.guard';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (request.currentUser.user.role !== 'super_admin') {
      throw new ApiException(
        HttpStatus.FORBIDDEN,
        'FORBIDDEN',
        'Akses hanya untuk super admin',
      );
    }
    return true;
  }
}
