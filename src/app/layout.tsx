import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://nextjs-blog-app-akju.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "VELO | Share Projects, Stories, and Ideas",
    template: "%s | VELO",
  },
  description: "VELO is a publishing community where anyone can share projects, stories, tutorials, and creative ideas.",
  applicationName: "VELO",
  keywords: [
    "VELO",
    "blog platform",
    "project sharing",
    "stories",
    "creator community",
    "publish posts",
    "tech and non-tech projects",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "VELO",
    title: "VELO | Share Projects, Stories, and Ideas",
    description: "A place for everyone to publish projects, write stories, and discover useful ideas.",
    images: [
      {
        url: "/VELO_logo.png",
        width: 1200,
        height: 630,
        alt: "VELO logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VELO | Share Projects, Stories, and Ideas",
    description: "A place for everyone to publish projects, write stories, and discover useful ideas.",
    images: ["/VELO_logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/velo_logo_without_bg.png",
    shortcut: "/velo_logo_without_bg.png",
    apple: "/velo_logo_without_bg.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider 
        attribute={"class"}
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <Toaster/>
      </body>
    </html>
  );
}
