"use client";
import { useEffect } from "react";
import {
  DynamicContextProvider,
  DynamicWidget,
} from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { ZeroDevSmartWalletConnectors } from "@dynamic-labs/ethereum-aa";
import { Turnkey } from "@turnkey/sdk-server";
import { DEFAULT_ETHEREUM_ACCOUNTS } from "@turnkey/sdk-server";
import { http } from "viem";
import { polygonAmoy } from "viem/chains";
import { ZeroDevProvider, createConfig } from "@zerodev/waas";
import ZerodevButton from "@/components/ZerodevButton";

// ZERODEV CONFIG
const PROJECT_ID = "623abbf4-0098-46d0-8987-5db86c7aa5a5";

const zerodevConfig = createConfig({
  chains: [polygonAmoy],
  transports: {
    [polygonAmoy.id]: http(),
  },
  projectIds: {
    [polygonAmoy.id]: PROJECT_ID,
  },
});

// TURNKEY CONFIG
// @TODO: Safe keys with 1Password
const turnkey = new Turnkey({
  apiBaseUrl: "https://api.turnkey.com",
  apiPrivateKey: "",
  apiPublicKey: "",
  defaultOrganizationId: "8c2ea955-273f-46d4-a597-bf43a9ea70bb",
});

const apiClient = turnkey.apiClient();

// TODOS
// Get unique walletName to create new turnkey account
// Need some way to select? What goal do we need for

const Home = () => {
  useEffect(() => {
    // turnkey wallet
    const createWallet = async () => {
      const walletResponse = await apiClient.createWallet({
        walletName: "dimoexample2",
        accounts: DEFAULT_ETHEREUM_ACCOUNTS,
      });
      const walletId = walletResponse.walletId;
      const accountAddress = walletResponse.addresses[0];
      console.log({ walletId, accountAddress });
    };

    //RESTORE FOR QUICK TURNKEY DEMO

    // if (apiClient) createWallet();
  }, [apiClient]);

  return (
    <ZeroDevProvider config={zerodevConfig}>
      <DynamicContextProvider
        settings={{
          environmentId: "e4cc6cd8-fc04-44e7-9fd6-1e57a83ae3c0",
          walletConnectors: [
            EthereumWalletConnectors,
            ZeroDevSmartWalletConnectors,
          ],
        }}
      >
        <DynamicWidget />
        <ZerodevButton />
      </DynamicContextProvider>
    </ZeroDevProvider>
  );
};

export default Home;
