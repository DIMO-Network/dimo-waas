export interface EmailAuthRequest {
  email: string;
  origin: string;
  key: string;
  redirectUrl: string;
  deployAccount?: boolean;
}

export interface EmailRecoveryRequest {
  email: string;
  origin: string;
  key: string;
  redirectUrl: string;
  deployAccount?: boolean;
}

export interface PasskeyRecoveryRequest {
  signedRecoveryRequest: {
    url: string;
    body: string;
    stamp: TurnkeyStamp;
  }
}

export interface TurnkeyStamp {
  stampHeaderName: string;
  stampHeaderValue: string;
}
