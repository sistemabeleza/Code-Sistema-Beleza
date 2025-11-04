import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ["latin"] });

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  title: "Sistema Beleza - Gestão de Salão",
  description: "Sistema completo de gestão para salões de beleza, barbearias e clínicas estéticas",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "Sistema Beleza - Gestão de Salão",
    description: "Sistema completo de gestão para salões de beleza, barbearias e clínicas estéticas",
    url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    siteName: "Sistema Beleza",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Sistema Beleza - Gestão de Salão",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sistema Beleza - Gestão de Salão",
    description: "Sistema completo de gestão para salões de beleza, barbearias e clínicas estéticas",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}