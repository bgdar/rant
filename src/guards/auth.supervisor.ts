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
    if (
      currentUrl.includes('supervosor/signIn') ||
      currentUrl.includes('supervisor/signUp')
    ) {
      return true;
    }

    const sessionSupervisor = (request as any).session?.user;

    if (!sessionSupervisor) {
      response.redirect('/');
      return false;
    }

    return true;
  }
}
