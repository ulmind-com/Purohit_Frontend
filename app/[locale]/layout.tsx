import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";

import { AppProviders } from "@/providers/app-providers";
import { AuroraBackground } from "@/components/shared/aurora-background";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/navigation";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Footer } from "@/components/shared/footer";

// Bound to `--font-sans` (not `--font-geist-sans`) because app/globals.css's
// shadcn `@theme` block reads `--font-sans` directly.
const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

// Generate localized metadata
export async function generateMetadata({ params }: Omit<Props, "children">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "SEO" });

  return {
    title: {
      default: t("title"),
      template: "%s · Purohit Booking",
    },
    description: t("description"),
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fdf8f3" },
    { media: "(prefers-color-scheme: dark)", color: "#221a12" },
  ],
};

export default async function RootLayout({
  children,
  params
}: Props) {
  const { locale } = await params;
  
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <AppProviders>
          <NextIntlClientProvider messages={messages} locale={locale}>
            <AuroraBackground />
            <main className="flex-1 w-full relative z-10 flex flex-col">
              {children}
            </main>
            <Footer />
            <Analytics />
            <SpeedInsights />
          </NextIntlClientProvider>
        </AppProviders>
      </body>
    </html>
  );
}
