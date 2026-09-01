import type { Metadata, Viewport } from "next";
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

// All routes render per-request (legacy parity): published images are
// pulled by the community to run their own condenser, so environment
// like SDC_GOOGLE_ANALYTICS_ID must never be baked into prerendered HTML.
export const dynamic = "force-dynamic";

// Google Analytics, injected exactly like legacy server-html.jsx: the id
// comes from the runtime env and the gtag scripts go straight into the
// SSR HTML so the browser loads them at parse time — no client-side
// injection and no hydration dependency.
const gaId = process.env.SDC_GOOGLE_ANALYTICS_ID;

// viewport-fit=cover is required for env(safe-area-inset-*) to take effect
// on notched phones (the mobile bottom tab bar pads against it).
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

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
        {/* GA, same as legacy server-html.jsx: plain script tags in the SSR
            HTML (async gtag.js + inline dataLayer/config init). */}
        {gaId ? (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaId}');`,
              }}
            />
          </>
        ) : null}
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}
