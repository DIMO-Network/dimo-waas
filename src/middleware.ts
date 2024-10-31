import {createRemoteJWKSet, jwtVerify} from 'jose';
import {NextRequest, NextResponse} from "next/server";

export const middleware = async (request: NextRequest) => {
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
        return NextResponse.json({error: "Unauthorized Access"}, {status: 401});
    }

    const JWKS = createRemoteJWKSet(new URL(process.env.JWT_KEY_SET_URL!));

    try{
        await jwtVerify(token, JWKS, {
            algorithms: ["RS256"],
            issuer: process.env.JWT_ISSUER
        });
    } catch (e) {
        console.error(e);
        return NextResponse.json({error: "Unauthorized Access"}, {status: 401});
    }

    return NextResponse.next();
}