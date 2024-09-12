import { ApiKeyStamper, TurnkeyServerClient } from "@turnkey/sdk-server";
import { TurnkeyClient } from "@turnkey/http";

const {
  TURNKEY_API_PRIVATE_KEY,
  TURNKEY_API_PUBLIC_KEY,
  TURNKEY_ORGANIZATION_ID,
  TURNKEY_API_BASE_URL,
  BUNDLER_RPC,
  PAYMASTER_RPC,
} = process.env;

const apiKeyStamper = new ApiKeyStamper({
  apiPublicKey: TURNKEY_API_PUBLIC_KEY!,
  apiPrivateKey: TURNKEY_API_PRIVATE_KEY!,
});

export const turnkeyClient = new TurnkeyServerClient({
  apiBaseUrl: TURNKEY_API_BASE_URL!,
  organizationId: TURNKEY_ORGANIZATION_ID!,
  stamper: apiKeyStamper,
});

export const stamperClient = new TurnkeyClient(
  {
    baseUrl: TURNKEY_API_BASE_URL!,
  },
  apiKeyStamper,
);

export const bundleRpc = BUNDLER_RPC!;
export const paymasterRpc = PAYMASTER_RPC!;
export const dimoApiPublicKey = TURNKEY_API_PUBLIC_KEY!;
