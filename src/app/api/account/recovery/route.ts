import {NextRequest, NextResponse} from "next/server";
import {EmailRecoveryRequest, PasskeyRecoveryRequest} from "@/src/models/auth";
import {getUserByEmail} from "@/src/services/user.service";
import {forwardSignedActivity, stamperClient, turnkeySupportClient} from "@/src/clients/turnkey";

const POST = async (request: NextRequest) => {
    const payload = (await request.json()) as EmailRecoveryRequest;

    if (!payload) {
        return NextResponse.json({error: "No payload provided"}, {status: 400});
    }
    const { email, redirectUrl, key, origin } = payload;

    const user = await getUserByEmail(email);

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { subOrganizationId } = user;

    await turnkeySupportClient.initUserEmailRecovery({
        organizationId: subOrganizationId!,
        email: email,
        targetPublicKey: key,
        emailCustomization: {
            appName: origin,
            magicLinkTemplate: `${redirectUrl}&token=%s`
        }
    });

    // this is so vercel doesn't complain about not returning a response
    return new Response(null, { status: 204 });
};

const PUT = async (request: NextRequest) => {
    const payload = (await request.json()) as PasskeyRecoveryRequest;

    if (!payload) {
        return NextResponse.json({error: "No payload provided"}, {status: 400});
    }

    const { signedRecoveryRequest, signedAuthenticatorRemoval } = payload;

    if (!signedRecoveryRequest) {
        return NextResponse.json({ error: "No signed recovery request provided" }, { status: 400 });
    }

    if (!signedAuthenticatorRemoval) {
        return NextResponse.json({ error: "No signed authenticator removal request provided" }, { status: 400 });
    }

    await forwardSignedActivity(signedAuthenticatorRemoval);

    await forwardSignedActivity(signedRecoveryRequest);

    return new Response(null, { status: 204 });
};

export { POST, PUT };