import {Turnkey} from '@turnkey/sdk-server';
import {Turnkey as PasskeyClient} from '@turnkey/sdk-browser';

const turnkeyApi = new Turnkey({
  apiBaseUrl: process.env.NEXT_PUBLIC_TURNKEY_API_BASE_URL!,
  apiPrivateKey: process.env.NEXT_PUBLIC_TURNKEY_API_PRIVATE_KEY!,
  apiPublicKey: process.env.NEXT_PUBLIC_TURNKEY_API_PUBLIC_KEY!,
  defaultOrganizationId: process.env.NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID!,
});

const turnkeyBrowser = new PasskeyClient({
  apiBaseUrl: process.env.NEXT_PUBLIC_TURNKEY_API_BASE_URL!,
  defaultOrganizationId: process.env.NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID!,
  rpId: 'localhost',
});

export const turnkeyApiClient = turnkeyApi.apiClient();
export const turnkeyPasskeyClient = turnkeyBrowser.passkeyClient();
