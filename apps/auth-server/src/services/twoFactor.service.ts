import axios from 'axios';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import { TwoFactorSecret, UserSecretKeyResponseDTO } from '@hst/dto';

export class TwoFactorService {
  generateSecret(email: string): TwoFactorSecret {
    const secret = speakeasy.generateSecret({
      name: `ft_transcendence (${email})`,
    });

    return {
      base32: secret.base32,
      otpauth_url: secret.otpauth_url!,
    };
  }

  async generateQRCode(otpauthUrl: string): Promise<string> {
    return await qrcode.toDataURL(otpauthUrl);
  }

  async getSecretFromMainServer(clientToken: string): Promise<string> {
    const response = await axios.get<UserSecretKeyResponseDTO>(
      `${process.env.MAIN_SERVER_URL}/api/user/twofa`,
      {
        headers: {
          Authorization: `Bearer ${clientToken}`,
        },
      },
    );

    return response.data.secretKey;
  }

  verifyToken(secret: string, token: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 1,
    });
  }
}
