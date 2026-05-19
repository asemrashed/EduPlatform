import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import Providers from "@/components/Providers";
import { loadWebsiteContentSettings } from "@/app/api/_lib/websiteContentStore";
import type { WebsiteContent } from "@/lib/websiteContentDefaults";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-headline",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  try {
    const raw = await loadWebsiteContentSettings();
    const cms = raw as unknown as WebsiteContent;
    const favicon = cms.branding?.faviconUrl?.trim();
    const metaTitle = cms.metaTitle?.trim();

    return {
      ...(metaTitle
        ? {
            title: {
              default: metaTitle,
              template: `%s · ${metaTitle.split("—")[0]?.trim() || "EduPlatform"}`,
            },
          }
        : {
            title: {
              default: "EduPlatform",
              template: "%s · EduPlatform",
            },
          }),
      description:
        "Online learning platform — courses, paths, and expert-led learning.",
      ...(favicon
        ? {
            icons: {
              icon: favicon,
              shortcut: favicon,
              apple: favicon,
            },
          }
        : {}),
    };
  } catch {
    return {
      title: {
        default: "EduPlatform",
        template: "%s · EduPlatform",
      },
      description:
        "Online learning platform — courses, paths, and expert-led learning.",
    };
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} ${inter.variable}`}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap"
        />
      </head>
      <body className="flex min-h-dvh flex-col bg-background font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
