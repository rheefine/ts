import { FastifyPluginAsyncTypebox, Type } from '@fastify/type-provider-typebox';
import {
  Auth2FASetupResponseSchema,
  Auth2FAVerifyRequestSchema,
  ErrorResponseSchema,
} from '@hst/dto';
import { AuthService } from '../../../services/auth.service.js';
import { TwoFactorService } from '../../../services/twoFactor.service.js';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const authService = new AuthService(fastify);
  const twoFactorService = new TwoFactorService();

  // OTP 시크릿 생성 및 QR 코드 발급
  fastify.get(
    '/twofa/setup',
    {
      schema: {
        querystring: Type.Object({
          email: Type.String(),
        }),
        response: {
          200: Auth2FASetupResponseSchema,
          400: ErrorResponseSchema,
        },
        tags: ['auth'],
      },
    },
    async (request, reply) => {
      const { email } = request.query;

      try {
        const secret = twoFactorService.generateSecret(email);
        const qrLink = await twoFactorService.generateQRCode(secret.otpauth_url);

        console.info(`Generated 2FA secret for user: ${email}, QR Link: ${qrLink}`);

        return reply.status(200).send({ qrLink, secretKey: secret.base32 });
      } catch (err) {
        request.log.error(err, 'Failed to save 2FA secret to main server');
        return reply.status(500).send({ error: 'Failed to save 2FA secret to main server' });
      }
    },
  );

  // OTP 코드 검증
  fastify.post(
    '/twofa/verify',
    {
      schema: {
        body: Auth2FAVerifyRequestSchema,
        response: {
          302: {},
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
        },
        tags: ['auth'],
      },
    },
    async (request, reply) => {
      const { token } = request.body;
      const clientToken = request.cookies.access_token;

      try {
        const secret = await twoFactorService.getSecretFromMainServer(
          clientToken,
          request.user.email,
        );
        const verified = twoFactorService.verifyToken(secret, token);

        if (!verified) {
          return reply.status(401).send({ error: 'Invalid token' });
        }

        const payload = {
          ...request.user,
          twofaVerified: true,
        };
        const twoFAToken = await fastify.jwt.sign(payload);
        return authService
          .setAuthCookie(reply, twoFAToken)
          .status(302)
          .redirect(`${process.env.CLIENT_SERVER_URL}/lobby`);
      } catch (err) {
        request.log.error(err, '2FA not configured');
        return reply.status(400).send({ error: '2FA not configured' });
      }
    },
  );
};

export default plugin;
