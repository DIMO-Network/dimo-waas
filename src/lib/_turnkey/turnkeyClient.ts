import {Turnkey} from '@turnkey/sdk-server';
import {
  Turnkey as PasskeyClient,
  TurnkeyBrowserClient,
} from '@turnkey/sdk-browser';
import {TurnkeyClient} from '@turnkey/http';
import {WebauthnStamper} from '@turnkey/webauthn-stamper';

// TODO do we really need multiple turnkey clients for all of the functionality we want??? - probably but double check

export const turnkey = new Turnkey({
  apiBaseUrl: process.env.NEXT_PUBLIC_TURNKEY_API_BASE_URL!,
  apiPrivateKey: process.env.NEXT_PUBLIC_TURNKEY_API_PRIVATE_KEY!,
  apiPublicKey: process.env.NEXT_PUBLIC_TURNKEY_API_PUBLIC_KEY!,
  defaultOrganizationId: process.env.NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID!,
});

export const passkeyClient = new PasskeyClient({
  apiBaseUrl: process.env.NEXT_PUBLIC_TURNKEY_API_BASE_URL!,
  defaultOrganizationId: process.env.NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID!,
  // TODO Update this to programmatically use an env var based on environment
  rpId: 'localhost',
});

// TODO We may not have to use this
// const iframeStamper = new IframeStamper({
//   iframeUrl: 'https://auth.turnkey.com',
//   iframeContainer: document.getElementById('turnkey-iframe-container'),
//   iframeElementId: 'turnkey-iframe',
// });
//
// export const turnkeyIframeClient = new TurnkeyClient(
//   {baseUrl: process.env.NEXT_PUBLIC_TURNKEY_API_BASE_URL!},
//   iframeStamper,
// );

export const passkeyStamper = new WebauthnStamper({
  // TODO Update this to programmatically use an env var based on environment
  rpId: 'localhost',
});

const turnkeyClient = new TurnkeyClient(
  {
    baseUrl: process.env.NEXT_PUBLIC_TURNKEY_API_BASE_URL!,
  },
  passkeyStamper,
);

export const browserClient = new TurnkeyBrowserClient({
  readOnlySession: '',
  stamper: undefined,
  apiBaseUrl: process.env.NEXT_PUBLIC_TURNKEY_API_BASE_URL!,
  organizationId: process.env.NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID!,
});

export const turnkeyProviderConfig = {
  apiBaseUrl: process.env.NEXT_PUBLIC_TURNKEY_API_BASE_URL!,
  serverSignUrl: process.env.NEXT_ZERODEV_PASSKEY_SERVER_URL,
  defaultOrganizationId: process.env.NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID!,
  rpId: 'localhost',
};

export const turnkeyClientWithStamper = turnkeyClient;
export const turnkeyApiClient = turnkey.apiClient();
export const turnkeyPasskeyClient = passkeyClient.passkeyClient();
