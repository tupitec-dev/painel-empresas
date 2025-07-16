import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});



export const metadata: Metadata = {
  title: "Painel Empresas • Tupitec",
  description: "Gerencie empresas, usuários e planos com o WebChat Tupitec.",
  openGraph: {
    title: "Painel Empresas • Tupitec",
    description: "Acesse o painel administrativo das empresas no WebChat Tupitec.",
    url: "https://painel-empresas.vercel.app",
    siteName: "Painel Empresas",
    images: [
      {
        url: "/og-image.jpg", // coloque a imagem em /public
        width: 1200,
        height: 630,
        alt: "Painel Empresas",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Painel Empresas • Tupitec",
    description: "Administre sua empresa com o WebChat Tupitec.",
    images: ["/og-image.jpg"],
  },
};




export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
