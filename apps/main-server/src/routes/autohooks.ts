import { FastifyInstance } from 'fastify';

export default async function (fastify: FastifyInstance) {
  fastify.addHook('onRequest', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      request.log.warn(err, 'JWT verification failed');
      return reply.status(401).send({
        error: 'Authentication required',
      });
    }
  });
}
