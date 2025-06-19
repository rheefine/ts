import { FastifyInstance } from 'fastify';

export default async function (fastify: FastifyInstance) {
  fastify.addHook('onRequest', async (request, reply) => {
    if (request.url.startsWith('/api/auth/google')) return;

    try {
      await request.jwtVerify();
      if (request.url.startsWith('/api/auth/twofa/verify')) return;
      if (request.user.twofaEnabled === true && request.user.twofaVerified === false) {
        throw new Error('twofa verifycation failed');
      }
    } catch (err) {
      request.log.warn(err, 'JWT verification failed');
      return reply.status(401).send({
        error: 'Authentication required',
      });
    }
  });
}
