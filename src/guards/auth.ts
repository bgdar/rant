import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const http = context.switchToHttp();
    const request = http.getRequest<FastifyRequest>();
    const response = http.getResponse<FastifyReply>();

    // Cek URL yang sedang diakses saat ini
    const currentUrl = request.url;

    // Jika user sedang menuju halaman signIn atau signUp, bypass Guard!
    if (
      currentUrl.includes('/user/signIn') ||
      currentUrl.includes('/user/signUp')
    ) {
      return true;
    }

    const sessionUser = (request as any).session?.user;

    if (!sessionUser) {
      response.redirect('/user/signIn');
      return false;
    }

    return true;
  }
}
