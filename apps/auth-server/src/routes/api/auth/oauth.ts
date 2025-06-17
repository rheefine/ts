import { FastifyPluginAsyncTypebox, Type } from '@fastify/type-provider-typebox';
import { ErrorResponseSchema } from '@hst/dto';
import { OAuthService } from '../../../services/oauth.service.js';
import { AuthService } from '../../../services/auth.service.js';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const oauthService = new OAuthService(fastify);
  const authService = new AuthService(fastify);

  fastify.get(
    '/google',
    {
      schema: {
        response: {
          302: {
            description: 'Redirect to Google OAuth',
          },
        },
        tags: ['auth'],
      },
    },
    async (request, reply) => {
      const redirectUrl = await oauthService.getGoogleAuthUrl();
      return reply.status(302).redirect(redirectUrl);
    },
  );

  fastify.get(
    '/verify',
    {
      schema: {
        response: {
          200: {},
        },
        tags: ['auth'],
      },
    },
    async (request, reply) => {
      return reply.status(200).send({ message: 'User is authenticated' });
    },
  );

  fastify.post(
    '/logout',
    {
      schema: {
        response: {
          200: Type.Object({
            message: Type.String(),
          }),
          302: {
            description: 'Redirect to login page',
          },
          400: ErrorResponseSchema,
        },
        tags: ['auth'],
      },
    },
    async (request, reply) => {
      try {
        authService.clearAuthCookie(reply);

        return reply.status(302).redirect('http://localhost:8080/');
      } catch (err) {
        request.log.error(err);
        return reply.status(400).send({ error: 'Logout failed' });
      }
    },
  );

  fastify.get(
    '/google/callback',
    {
      schema: {
        querystring: Type.Object({
          code: Type.String(),
        }),
        response: {
          302: {
            description: 'Redirect to lobby or twofa page',
          },
          400: ErrorResponseSchema,
          500: ErrorResponseSchema,
        },
        tags: ['auth'],
      },
    },
    async (request, reply) => {
      const { code } = request.query;
      if (!code) {
        return reply.status(400).send({ error: 'Missing code' });
      }

      try {
        const accessToken = await oauthService.exchangeCodeForToken(code);
        const userInfo = await oauthService.getGoogleUserInfo(accessToken);

        const payload = {
          email: userInfo.email,
          googleId: userInfo.id,
          name: userInfo.name,
          twoFA: false,
        };

        const token = await fastify.jwt.sign(payload);
        const twoFA = await oauthService.checkTwoFAStatus(token, userInfo.email);

        const redirectUrl = authService.getRedirectUrl(twoFA);

        return authService
          .setAuthCookie(reply, token)
          .status(302)
          .redirect(`http://localhost:8080${redirectUrl}`);
      } catch (err) {
        request.log.error(err);
        return reply.status(500).send({ error: 'OAuth failed' });
      }
    },
  );
};

export default plugin;
