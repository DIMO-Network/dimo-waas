'use client';

import {
  AlchemyAccountProvider,
  AlchemyAccountsProviderProps,
} from '@alchemy/aa-alchemy/react';
import {PropsWithChildren} from 'react';
import {config, queryClient} from '@/config';
import {ThemeProvider} from 'next-themes';
import {TurnkeyProvider} from '@turnkey/sdk-react';
import {turnkeyProviderConfig} from '@/lib/_turnkey/turnkeyClient';

export const Providers = ({
  initialState,
  children,
}: PropsWithChildren<{
  initialState?: AlchemyAccountsProviderProps['initialState'];
}>) => {


  return (
    <ThemeProvider attribute="class">
      <TurnkeyProvider config={turnkeyProviderConfig}>
        <AlchemyAccountProvider
          config={config}
          queryClient={queryClient}
          initialState={initialState}>
          {children}
        </AlchemyAccountProvider>
      </TurnkeyProvider>
    </ThemeProvider>
  );
};
