import {TurnkeySigner} from '@turnkey/ethers';
import {turnkeyApiClient} from '@/lib/_turnkey/turnkeyClient';

export const signWithWallet = async (walletAddress: string, challenge: string, organizationId: string) => {
    const turnkeySigner = new TurnkeySigner({
        signWith: walletAddress,
        client: turnkeyApiClient,
        organizationId: organizationId,
    });

    console.info('turnkeySigner', turnkeySigner);





};
