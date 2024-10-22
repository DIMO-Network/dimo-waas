export enum OtpType {
  SMS = "OTP_TYPE_SMS",
  EMAIL = "OTP_TYPE_EMAIL",
}

export interface CodeDeliveryRequest {
  email: string;
  otpType: OtpType.EMAIL;
  redirectUrl: string;
}
export interface CodeAuthenticationRequest {
  email: string;
  otpId: string;
  otpCode: string;
  key: string;
}
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
  signedRecoveryRequest: IStampedRequest;
  signedAuthenticatorRemoval: IStampedRequest;
}

export interface IStampedRequest {
  url: string;
  body: string;
  stamp: TurnkeyStamp;
}

export interface TurnkeyStamp {
  stampHeaderName: string;
  stampHeaderValue: string;
}
