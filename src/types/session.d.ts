import '@fastify/secure-session';

// pastikan sama dengan yang ada di supervisorDTO , UserDTO
declare module '@fastify/secure-session' {
  interface SessionData {
    supervisor?: {
      id: string;
      username: string;
      email: string;
      role: string;
    };

    user?: {
      id: string;
      username: string;
      email: string;
      role: string;
    };
  }
}
