import type { Metadata } from "next";
import { Geist_Mono, Source_Sans_3 } from "next/font/google";
import Script from "next/script";
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

// Google Analytics via gtag.js (legacy server-html.jsx). Disabled unless
// SDC_GOOGLE_ANALYTICS_ID is set; legacy config defaulted it to false.
const gaId = process.env.SDC_GOOGLE_ANALYTICS_ID;

export const metadata: Metadata = {
  title: "Condenser - Steemit Frontend",
  description: "Modernized Steemit frontend built with Next.js",
  // Favicon set ported from legacy (src/app/assets/images/favicons,
  // server-html.jsx <link> list). app/favicon.ico is served automatically;
  // these cover PNG sizes + apple-touch icons.
  icons: {
    icon: [
      { url: "/images/favicons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/images/favicons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/images/favicons/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/images/favicons/favicon-196x196.png", sizes: "196x196", type: "image/png" },
    ],
    apple: [
      { url: "/images/favicons/apple-touch-icon-57x57.png", sizes: "57x57" },
      { url: "/images/favicons/apple-touch-icon-60x60.png", sizes: "60x60" },
      { url: "/images/favicons/apple-touch-icon-72x72.png", sizes: "72x72" },
      { url: "/images/favicons/apple-touch-icon-76x76.png", sizes: "76x76" },
      { url: "/images/favicons/apple-touch-icon-114x114.png", sizes: "114x114" },
      { url: "/images/favicons/apple-touch-icon-120x120.png", sizes: "120x120" },
      { url: "/images/favicons/apple-touch-icon-144x144.png", sizes: "144x144" },
      { url: "/images/favicons/apple-touch-icon-152x152.png", sizes: "152x152" },
    ],
  },
  manifest: "/images/favicons/manifest.json",
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
        {gaId ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="ga-gtag-init" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaId}');`}
            </Script>
          </>
        ) : null}
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}
