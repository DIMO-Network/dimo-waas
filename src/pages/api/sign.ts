import {turnkey} from "@/lib/_turnkey/turnkeyClient";
import {NextApiResponse} from "next";

const proxyHandler = turnkey.nextProxyHandler({
    allowedMethods:[ "createSubOrganization",
        "emailAuth",
        "initUserEmailRecovery",
        "getSubOrgIds" ]
});

export default function handler(req: any, res: NextApiResponse) {
    console.info('Request: ', req);
    return proxyHandler(req, res);
}