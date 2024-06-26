import {http} from 'viem';
import {polygonAmoy} from 'viem/chains';
import {ZeroDevProvider, createConfig} from '@zerodev/waas';

export default function ZerodevProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const PROJECT_ID = 'f4d1596a-edfd-4063-8f99-2d8835e07739';

  const config = createConfig({
    chains: [polygonAmoy],
    transports: {
      [polygonAmoy.id]: http(),
    },
    projectIds: {
      [polygonAmoy.id]: PROJECT_ID,
    },
  });

  return <ZeroDevProvider config={config}>{children}</ZeroDevProvider>;
}
