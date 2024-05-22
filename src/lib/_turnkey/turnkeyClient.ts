import {Turnkey} from '@turnkey/sdk-server';

const turnkey = new Turnkey({
  apiBaseUrl: 'https://api.turnkey.com',
  apiPrivateKey: process.env.TURNKEY_API_PRIVATE_KEY || 'e582a97d7f5f2cb0954905852ad3532e382f9bb27d028f010b98f8714c8c7cd5',
  apiPublicKey: process.env.TURNKEY_API_PUBLIC_KEY || '0202edf69606ac23b40041653d1fac7573800eec27158155875b189b7a05362048',
  defaultOrganizationId: process.env.TURNKEY_ORGANIZATION_ID || '9824a5dc-be8d-45c7-9009-90caddbb490c',
});

export const turnkeyApiClient = turnkey.apiClient();
