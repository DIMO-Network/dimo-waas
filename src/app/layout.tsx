import type {Metadata} from 'next';
import React from 'react';
import {Fira_Code} from 'next/font/google';
import './globals.css';
import {cookieToInitialState} from '@alchemy/aa-alchemy/config';
import {headers} from 'next/headers';
import {config} from '@/config';
import {Providers} from './providers';

const firaCode = Fira_Code({subsets: ['latin']});

export const metadata: Metadata = {
  title: 'DIMO WaaS',
  description: '',
};

// hydrate the initial state on the client
const initialState = cookieToInitialState(
  config,
  headers().get('cookie') ?? undefined,
);

export default function RootLayout({
  children,
}: Readonly<{children: React.ReactNode}>) {
  return (
    // Hydration warning suppression to prevent console errors for NextTheme
    <html lang="en" suppressHydrationWarning>
      {/* Hydration warning suppression to prevent console errors for browser installed apps */}
      <body className={firaCode.className} suppressHydrationWarning={true}>
        <Providers initialState={initialState}>{children}</Providers>
      </body>
    </html>
  );
}
