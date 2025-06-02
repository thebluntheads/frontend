import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import { GoogleTagManager } from "@next/third-parties/google"
import "styles/globals.css"
import { NextIntlClientProvider } from "next-intl"
import { DEFAULT_LOCALE } from "../i18n/routing"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  title: "The Blunt Heads",
  description:
    "The Blunt Heads is a premium animated series created for cannabis culture lovers and comedy fans alike. Stream original episodes, vibe to the official soundtrack, and shop exclusive merch — all in one place.",
  themeColor: "#000000",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "The Blunt Heads",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  // For now, use the default locale
  // The actual locale will be determined by the middleware
  const locale = DEFAULT_LOCALE
  
  // Load messages for the current locale
  const messages = (await import(`../lib/messages/${locale}.json`)).default

  return (
    <html lang={locale} data-mode="light">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        <meta name="theme-color" content="#000000" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
      </head>
      <GoogleTagManager gtmId="AW-17062730933" />
      <body className="bg-black">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <main className="relative">{props.children}</main>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
