"use client";

import {
  DynamicContextProvider,
  DynamicWidget,
} from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { ZeroDevSmartWalletConnectors } from "@dynamic-labs/ethereum-aa";
const Home = () => (
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
  </DynamicContextProvider>
);

export default Home;
