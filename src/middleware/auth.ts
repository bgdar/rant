import { Injectable } from '@nestjs/common';
import { NestMiddleware } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';

@Injectable()
export class Auth implements NestMiddleware {
  async use(
    req: FastifyRequest,
    res: FastifyReply,
    next: (error?: any) => void,
  ) {
    // gunakna cookies lagi wkwkw
    const token = req.cookies.token;

    if (!token) {
      return res.redirect('/user/signIn', 400);
    }

    next();
  }
}
