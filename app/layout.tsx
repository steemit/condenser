import type { Metadata } from "next";
import { Geist_Mono, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { ReduxProvider } from "@/store/Provider";

const sourceSans = Source_Sans_3({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Condenser - Steemit Frontend",
  description: "Modernized Steemit frontend built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${sourceSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        {/* Post-body serif font, same source as legacy (server-html.jsx).
            Loaded via Google Fonts CDN because next/font/google does not
            ship Source Serif Pro. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Source+Serif+Pro:400,600&display=swap"
        />
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}
