import {cookieStorage, createConfig} from '@alchemy/aa-alchemy/config';
import {polygonAmoy} from '@alchemy/aa-core';
import {QueryClient} from '@tanstack/react-query';

// @ts-ignore
export const chain = polygonAmoy;
// TODO look into how to set up this alchemy config to use the Turnkey signer
export const config = createConfig({
  // this is for requests to the specific chain RPC
  rpcUrl: '/api/rpc/chain/' + chain.id,
  signerConnection: {
    // this is for Alchemy Signer requests
    rpcUrl: '/api/rpc/',
  },
  chain,
  ssr: true,
  storage: cookieStorage,
});

// provide a query client for use by the alchemy accounts provider
export const queryClient = new QueryClient();
