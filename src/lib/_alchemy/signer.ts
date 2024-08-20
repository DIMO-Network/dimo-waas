import {
  TurnkeySigner,
  TurnkeySubOrganization,
} from '@alchemy/aa-signers/turnkey';
import {WebauthnStamper} from '@turnkey/webauthn-stamper';
import {http} from 'viem';

export const turnkeyAASigner = async () => {
  const turnkeySigner = new TurnkeySigner({
    apiUrl: process.env.NEXT_PUBLIC_TURNKEY_API_URL!,
    // API Key, WebAuthn, or Email Auth [stampers](https://docs.turnkey.com/category/api-design)
    // must sign all requests to Turnkey.
    stamper: new WebauthnStamper({
      rpId: 'localhost',
    }),
  });

  await turnkeySigner.authenticate({
    resolveSubOrganization: async () => {
      return new TurnkeySubOrganization({
        subOrganizationId: '12345678-1234-1234-1234-123456789abc',
        signWith: '0x1234567890123456789012345678901234567890',
      });
    },
    transport: http(
      `https://polygon-amoy.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
    ),
  });

  return turnkeySigner;
};
