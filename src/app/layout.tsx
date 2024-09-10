import type {Metadata} from "next";
import React from 'react';
import {Fira_Code} from "next/font/google";
import "./globals.css";

const firaCode = Fira_Code({subsets: ['latin']});

export const metadata: Metadata = {
  title: 'DIMO WaaS',
  description: '',
};

export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return (
    <html lang="en">
      <body className={firaCode.className}>
          {children}
      </body>
    </html>
  );
}
