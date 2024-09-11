import {turnkey} from "@/lib/_turnkey/turnkeyClient";
import {NextApiRequest, NextApiResponse} from "next";
import {NextRequest, NextResponse} from "next/server";

const proxyHandler = turnkey.nextProxyHandler({
    allowedMethods:[ "createSubOrganization",
        "emailAuth",
        "initUserEmailRecovery",
        "getSubOrgIds" ]
})

const POST = (request: NextRequest) => {
    const t = new NextResponse();
     return proxyHandler(request, NextResponse);
};

export { POST };