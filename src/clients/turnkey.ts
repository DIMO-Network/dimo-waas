import {ApiKeyStamper, TurnkeySDKApiTypes, TurnkeyServerClient} from "@turnkey/sdk-server";
import { TurnkeyClient } from "@turnkey/http";
import {IStampedRequest, TurnkeyStamp} from "@/src/models/auth";

const {
  TURNKEY_API_PRIVATE_KEY,
  TURNKEY_API_PUBLIC_KEY,
  TURNKEY_SUPPORT_API_PRIVATE_KEY,
  TURNKEY_SUPPORT_API_PUBLIC_KEY,
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

export const turnkeySupportClient = new TurnkeyServerClient({
    apiBaseUrl: TURNKEY_API_BASE_URL!,
    organizationId: TURNKEY_ORGANIZATION_ID!,
    stamper: new ApiKeyStamper({
        apiPublicKey: TURNKEY_SUPPORT_API_PUBLIC_KEY!,
        apiPrivateKey: TURNKEY_SUPPORT_API_PRIVATE_KEY!,
    }),
});


export const bundleRpc = BUNDLER_RPC!;
export const paymasterRpc = PAYMASTER_RPC!;
export const dimoApiPublicKey = TURNKEY_API_PUBLIC_KEY!;

export const forwardSignedActivity = async (stampedRequest: IStampedRequest) => {
    const delay = 1000;
    const maxAttempts = 5;

    const { url, body, stamp } = stampedRequest;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, delay*(attempt+1)));

        const { status, responseBody } = await forwardSignedRequest(url, body, stamp);

        console.info(`Forwarded activity attempt ${attempt+1} with status ${status}`);
        console.info("And response body", responseBody);

        if (status !== 200) {
            throw new Error(`Failed to forward signed request: ${status}`);
        }

        const { activity } = responseBody;
        switch (activity.status) {
            case ActivityStatus.CREATED:
            case ActivityStatus.PENDING:
                console.info(`Activity is still ${activity.status}`);
                continue;
            case ActivityStatus.COMPLETED:
                console.info(`Activity ${activity.id} is ${activity.status}`);
                return responseBody;
            case ActivityStatus.FAILED:
                throw new Error(`Forwarded activity failed after ${attempt} attempts`);
            case ActivityStatus.CONSENSUS_NEEDED:
                throw new Error(`Forwarded activity needs consensus after ${attempt} attempts`);
            case ActivityStatus.REJECTED:
                throw new Error(`Forwarded activity was rejected after ${attempt} attempts`);
            default:
                console.info(`Activity ${activity.id} is in an unknown state`);
                break;
        }
    }
};

// private function
const forwardSignedRequest = async (url: string, body: string, stamp: TurnkeyStamp) => {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            [stamp.stampHeaderName]: stamp.stampHeaderValue,
        },
        body: body
    });

    const responseBody = await response.json();

    return {
        status: response.status,
        responseBody,
    };
}

enum ActivityStatus {
    CREATED = "ACTIVITY_STATUS_CREATED",
    PENDING = "ACTIVITY_STATUS_PENDING",
    COMPLETED = "ACTIVITY_STATUS_COMPLETED",
    FAILED = "ACTIVITY_STATUS_FAILED",
    CONSENSUS_NEEDED = "ACTIVITY_STATUS_CONSENSUS_NEEDED",
    REJECTED = "ACTIVITY_STATUS_REJECTED",
}
