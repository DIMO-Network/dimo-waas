import {Turnkey} from '@turnkey/sdk-server';
import {Turnkey as PasskeyClient} from '@turnkey/sdk-browser';
import {IframeStamper} from '@turnkey/iframe-stamper';
import {TurnkeyClient} from '@turnkey/http';
import {WebauthnStamper} from "@turnkey/webauthn-stamper";

// TODO do we really need multiple turnkey clients for all of the functionality we want??? - probably but double check

const turnkeyApi = new Turnkey({
  apiBaseUrl: process.env.NEXT_PUBLIC_TURNKEY_API_BASE_URL!,
  apiPrivateKey: process.env.NEXT_PUBLIC_TURNKEY_API_PRIVATE_KEY!,
  apiPublicKey: process.env.NEXT_PUBLIC_TURNKEY_API_PUBLIC_KEY!,
  defaultOrganizationId: process.env.NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID!,
});

const turnkeyBrowser = new PasskeyClient({
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

const stamper = new WebauthnStamper({
  // TODO Update this to programmatically use an env var based on environment
  rpId: 'localhost',
});

const turnkeyClient = new TurnkeyClient({
  baseUrl: process.env.NEXT_PUBLIC_TURNKEY_API_BASE_URL!,
}, stamper);

export const turnkeyProviderConfig = {
  apiBaseUrl: process.env.NEXT_PUBLIC_TURNKEY_API_BASE_URL!,
  serverSignUrl: process.env.NEXT_ZERODEV_PASSKEY_SERVER_URL,
  defaultOrganizationId: process.env.NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID!,
  rpId: 'localhost',
};

export const turnkeyClientWithStamper = turnkeyClient;
export const turnkeyApiClient = turnkeyApi.apiClient();
export const turnkeyPasskeyClient = turnkeyBrowser.passkeyClient();
