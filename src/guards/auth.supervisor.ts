import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';

@Injectable()
export class AuthSupervisorGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const http = context.switchToHttp();
    const request = http.getRequest<FastifyRequest>();
    const response = http.getResponse<FastifyReply>();

    // Cek URL yang sedang diakses saat ini
    const currentUrl = request.url;

    // Jika user sedang menuju halaman signIn atau signUp, bypass Guard!
    if (currentUrl.includes('/supervisor/update-user')) {
      return true;
    }

    const sessionSupervisor = (request as any).session?.supervisor;

    console.info('supervisor update user to /supervisor/update-user');

    if (!sessionSupervisor) {
      response.redirect('/supervisor/update-user');
      return false;
    }

    return true;
  }
}










